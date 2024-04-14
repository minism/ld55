import { updateGameState } from "@/game/db/db";
import { fetchApiGameContext } from "@/server/apiContext";
import { canRequesterAct } from "@/server/apiLogic";

// TODO: Here and elsewhere, validation/state checking. For now assume client is okay.

export async function POST(request: Request) {
  const context = await fetchApiGameContext(request);
  if (!canRequesterAct(context)) {
    return Response.json({});
  }
  const { game, req } = context;

  game.state.turn++;

  // Refresh entity state.
  game.state;

  await updateGameState(game);
  return Response.json({});
}
