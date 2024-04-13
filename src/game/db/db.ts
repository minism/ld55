import { GameState } from "@/game/db/gameState";
import { Game } from "@/game/db/types";
import { Database } from "@/generated/database.types";
import { createClient } from "@/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";

let supabase = createClient();
export function provideSupabaseClient(client: SupabaseClient<Database>) {
  supabase = client;
}

export async function fetchGameState(gameId: string): Promise<Game> {
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

export async function updateGameState(game: Game) {
  await supabase
    .from("game")
    .update({ state: game.state })
    .eq("id", game.id)
    .throwOnError();
}

export async function fetchPlayersForGame(game: Game) {
  return {
    host: (
      await supabase
        .from("user_profile")
        .select()
        .eq("id", game.host_id)
        .single()
        .throwOnError()
    ).data!,
    challenger:
      game.challenger_id != null
        ? (
            await supabase
              .from("user_profile")
              .select()
              .eq("id", game.challenger_id)
              .single()
              .throwOnError()
          ).data
        : null,
  };
}
