import { ApiGameContext } from "@/server/apiContext";

export function isRequestersTurn(context: ApiGameContext) {
  const { user, game } = context;
  const activePlayerId =
    game.state.turn % 2 == 0 ? game.host_id : game.challenger_id;
  return activePlayerId === user.id;
}

export function hasGameStarted(context: ApiGameContext) {
  return context.game.challenger_id != null;
}

export function canRequesterAct(context: ApiGameContext) {
  return hasGameStarted(context) && isRequestersTurn(context);
}
