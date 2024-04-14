import { Entity, GameState } from "@/game/db/gameState";

export function addEntity(
  state: GameState,
  entity: Omit<Entity, "id">
): GameState {
  const id = state.nextEntityId;

  return {
    ...state,
    nextEntityId: id + 1,
    entities: {
      ...state.entities,
      [id]: entity,
    },
  };
}
