import GameContainer from "@/components/GameContainer";
import { getAuthenticatedSupabaseOrRedirect } from "@/supabase/server";

export default async function Game() {
  const { user, supabase } = await getAuthenticatedSupabaseOrRedirect();

  return (
    // <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <main className="flex min-h-screen flex-col items-center p-16">
      <h1 className="text-xl my-4">Playing as {user.user_metadata.username}</h1>
      <GameContainer />
    </main>
  );
}
