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

  // TODO: Check owner.
  // TODO: Check entity stacking.
  const entity = game.state.entities[req.entityId];

  if (entity.remainingActions < 1) {
    return Response.json({});
  }

  entity.tile = {
    q: req.q,
    r: req.r,
  };
  entity.remainingActions--;
  await updateGameState(game);

  return Response.json({});
}
