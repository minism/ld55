import GameClient from "@/components/GameClient";
import { getAuthenticatedSupabaseOrRedirect } from "@/supabase/server";

export default async function Game({ params }: { params: { id: string } }) {
  // Fetch the game.
  const { user, supabase } = await getAuthenticatedSupabaseOrRedirect();
  const { data: profile } = await supabase
    .from("user_profile")
    .select()
    .eq("id", user.id)
    .throwOnError()
    .single();
  const { data: game, error } = await supabase
    .from("game")
    .select()
    .eq("id", params.id)
    .single()
    .throwOnError();

  // If there isn't an opponent yet and we're not the host, join the game.
  if (game!.host_id != profile!.id && game!.challenger_id == null) {
    await supabase
      .from("game")
      .update({
        challenger_id: profile!.id,
      })
      .eq("id", game!.id)
      .throwOnError();
  }

  return (
    // <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <main className="flex min-h-screen flex-col">
      <div className="p-4">
        <h1 className="text-xl">Playing as {profile!.username}</h1>
      </div>
      <GameClient gameId={game!.id} userId={profile!.id} />
    </main>
  );
}
