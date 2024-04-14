import GameClient from "@/components/GameClient";
import { startGame } from "@/game/logic/stateMutations";
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
    // Transition to start game state
    // @ts-expect-error
    const state = startGame(game!.state);

    await supabase
      .from("game")
      .update({
        challenger_id: profile!.id,
        // @ts-expect-error
        state,
      })
      .eq("id", game!.id)
      .throwOnError();
  }

  return (
    <main className="flex min-h-screen flex-col">
      <GameClient gameId={game!.id} userId={profile!.id} />
    </main>
  );
}
