import { fetchGameState } from "@/game/db/db";
import { DbGame } from "@/game/db/types";
import { Database } from "@/generated/database.types";
import { getAuthenticatedSupabaseOrRedirect } from "@/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";

export interface ApiGameContext {
  req: any;
  supabase: SupabaseClient<Database>;
  user: User;
  game: DbGame;
}

// This should be a middleware.
export async function fetchApiGameContext(
  request: Request
): Promise<ApiGameContext> {
  const { supabase, user } = await getAuthenticatedSupabaseOrRedirect();
  const req = await request.json();
  const game = await fetchGameState(req.gameId);

  return {
    req,
    supabase,
    user,
    game,
  };
}
