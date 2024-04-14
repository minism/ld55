import { Entity, GameState } from "@/game/db/gameState";

// Note we don't use immutable data structures here but we still take in and
// return state so we could eventually transition to this. Callers should
// treat state as immutable outside these mutation functions, though.

export function addEntity(
  state: GameState,
  entity: Omit<Entity, "id" | "remainingActions">
): GameState {
  const id = state.nextEntityId++;
  state.entities[id] = {
    id,
    remainingActions: 2,
    ...entity,
  };
  return state;
}
