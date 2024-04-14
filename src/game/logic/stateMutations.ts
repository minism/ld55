import { Entity, GameState } from "@/game/db/gameState";
import _ from "lodash";

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
    remainingActions: 1,
    ...entity,
  };
  return state;
}

export function nextTurn(state: GameState) {
  state.turn++;

  // Refresh entities.
  Object.values(state.entities).forEach((e) => {
    e.remainingActions = 1;
  });

  return state;
}
