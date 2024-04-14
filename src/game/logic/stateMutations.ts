import { entityDefsById } from "@/game/data/entityDefs";
import { Entity, GameState } from "@/game/db/gameState";

// Note we don't use immutable data structures here but we still take in and
// return state so we could eventually transition to this. Callers should
// treat state as immutable outside these mutation functions, though.

export function addEntity(
  state: GameState,
  defId: string,
  data: Pick<Entity, "owner" | "tile">
): GameState {
  const def = entityDefsById[defId];
  const id = state.nextEntityId++;
  state.entities[id] = {
    id,
    remainingActions: 1,
    def: defId,
    hp: def.hp,
    ...data,
  };
  return state;
}

export function startGame(state: GameState) {
  // Draw 7 cards each.
  state = drawCards(state, 7, true);
  state = drawCards(state, 7, false);
  return nextTurn(state);
}

export function nextTurn(state: GameState) {
  state.turn++;

  // Draw a card unless its the first turn.
  if (state.turn > 1) {
    const isHostTurn = state.turn % 2 == 1;
    state = drawCards(state, 1, isHostTurn);
  }

  // Refresh entities.
  Object.values(state.entities).forEach((e) => {
    e.remainingActions = 1;
  });

  return state;
}

function drawCards(state: GameState, count: number, host: boolean) {
  const deck = host ? state.decks.host : state.decks.challenger;
  const hand = host ? state.hands.host : state.hands.challenger;
  // TODO: Overflow here.
  for (let i = 0; i < count; i++) {
    hand.push(deck.pop()!);
  }
  return state;
}
