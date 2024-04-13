import { fetchGameState, updateGameState } from "@/game/db/db";
import { GameState } from "@/game/db/gameState";
import { getAuthenticatedSupabaseOrRedirect } from "@/supabase/server";

// TODO: Here and elsewhere, validation/state checking. For now assume client is okay.

export async function POST(request: Request) {
  const req = await request.json();

  // The game fetch is slow -- we could use caching, but also clientside prediction will help.
  const t0 = performance.now();
  const { supabase, user } = await getAuthenticatedSupabaseOrRedirect();
  const t1 = performance.now();
  const game = await fetchGameState(req.gameId);
  const t2 = performance.now();
  console.log(t1 - t0);
  console.log(t2 - t1);

  if (game.challenger_id == null) {
    return Response.json({});
  }

  // Check if its this players turn.
  const activePlayerId =
    game.state.turn % 2 == 0 ? game.host_id : game.challenger_id;
  if (activePlayerId != user.id) {
    return Response.json({});
  }

  // TODO: Check owner.
  game.state.entities[req.entityId].tile = {
    q: req.q,
    r: req.r,
  };
  game.state.turn++;
  await updateGameState(game);

  return Response.json({});
}
