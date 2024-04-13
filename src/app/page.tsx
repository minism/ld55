import { getAuthenticatedSupabaseOrRedirect } from "@/supabase/server";

export default async function Home() {
  const { user } = await getAuthenticatedSupabaseOrRedirect();

  return <main className="flex min-h-screen flex-col items-center p-16"></main>;
}
