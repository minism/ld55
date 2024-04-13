import GameContainer from "@/components/GameContainer";
import { getAuthenticatedSupabaseOrRedirect } from "@/supabase/server";

export default async function Game({ params }: { params: { id: string } }) {
  // Fetch the game.
  const { profile, supabase } = await getAuthenticatedSupabaseOrRedirect();
  const { data, error } = await supabase
    .from("game")
    .select()
    .eq("id", params.id)
    .single();
  if (error != null) {
    throw error;
  }

  return (
    // <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <main className="flex min-h-screen flex-col items-center p-16">
      <h1 className="text-xl my-4">Playing as {profile.username}</h1>
      <GameContainer />
    </main>
  );
}
