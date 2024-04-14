import { GameState } from "@/game/db/gameState";
import { DbGame } from "@/game/db/types";
import { Database } from "@/generated/database.types";
import { createClient } from "@/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

let supabase = createClient();
export function provideSupabaseClient(client: SupabaseClient<Database>) {
  supabase = client;
}

export async function fetchGameState(gameId: string): Promise<DbGame> {
  const game = (
    await supabase
      .from("game")
      .select()
      .eq("id", gameId)
      .single()
      .throwOnError()
  ).data!;

  return {
    ...game,
    // @ts-expect-error
    state: game.state as GameState,
  };
}

export async function updateGameState(game: DbGame) {
  await supabase
    .from("game")
    .update({ state: game.state })
    .eq("id", game.id)
    .throwOnError();
}

export async function fetchPlayersForGame(game: DbGame) {
  const ids = [game.host_id];
  if (game.challenger_id != null) {
    ids.push(game.challenger_id);
  }
  return (
    await supabase.from("user_profile").select().in("id", ids).throwOnError()
  ).data!;
}
