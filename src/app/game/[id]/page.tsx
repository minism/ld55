import GameClient from "@/components/GameClient";
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
    <main className="flex min-h-screen flex-col">
      <div className="p-4">
        <h1 className="text-xl">Playing as {profile.username}</h1>
      </div>
      <GameClient gameId={data.id} userId={profile.id} />
    </main>
  );
}
