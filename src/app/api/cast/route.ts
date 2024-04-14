import { updateGameState } from "@/game/db/db";
import { castCard, moveEntity } from "@/game/logic/stateMutations";
import { fetchApiGameContext } from "@/server/apiContext";
import { canRequesterAct } from "@/server/apiLogic";

// TODO: Here and elsewhere, validation/state checking. For now assume client is okay.

export async function POST(request: Request) {
  const context = await fetchApiGameContext(request);
  if (!canRequesterAct(context)) {
    return Response.json({});
  }
  const { game, req } = context;

  // @ts-expect-error: State fix
  game.state = castCard(game.state, req.cardIndex, req.q, req.r);

  await updateGameState(game);

  return Response.json({});
}
