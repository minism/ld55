import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { User, createClient as createClientRaw } from "@supabase/supabase-js";
import { configDotenv } from "dotenv";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

configDotenv();

export const createClient = <T = any>() => {
  const cookieStore = cookies();

  return createServerClient<T>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

export async function getAuthenticatedSupabaseOrRedirect<T = any>(
  requireAdmin = false
) {
  // Lookup the user.
  const supabase = createClient<T>(cookies());
  const response = await supabase.auth.getUser();
  const user = response.data.user;
  if (user == null) {
    return redirect("/login");
  }

  // Run user initialization logic.

  return { supabase, user };
}

enum InitializeUserResult {
  OK,
  NO_MATCHING_TEAM_DOMAIN,
}
