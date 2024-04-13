import { provideSupabaseClient } from "@/game/db/db";
import { Database } from "@/generated/database.types";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { configDotenv } from "dotenv";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

configDotenv();

export const createClient = <T = Database>() => {
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

export async function getAuthenticatedSupabaseOrRedirect() {
  // Lookup the user.
  const supabase = createClient<Database>();
  provideSupabaseClient(supabase);
  const response = await supabase.auth.getUser();
  const user = response.data.user;
  if (user == null) {
    return redirect("/login");
  }
  return { supabase, user: user! };
}
