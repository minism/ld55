import { cardDefsByEntityId } from "@/game/data/cardDefs";
import { entityDefsById } from "@/game/data/entityDefs";
import { Entity, GameState } from "@/game/db/gameState";
import _ from "lodash";

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

export function moveEntity(
  state: GameState,
  entityId: string,
  q: number,
  r: number
) {
  // TODO: Check owner.
  // TODO: Check entity stacking.
  const entity = state.entities[entityId];
  if (entity.remainingActions < 1) {
    return state;
  }
  entity.tile = { q, r };
  entity.remainingActions--;

  // state.turnActions.push({
  //   type: "move",
  //   actionEntityId: entityId,
  //   tile: { q, r },
  // });

  return state;
}

export function castCard(
  state: GameState,
  cardIndex: number,
  q: number,
  r: number
) {
  const isHostTurn = state.turn % 2 == 1;
  const playerState = isHostTurn
    ? state.playerStates.host
    : state.playerStates.challenger;
  const handState = isHostTurn ? state.hands.host : state.hands.challenger;
  if (handState[cardIndex] == null) {
    return state;
  }

  const cardDef = cardDefsByEntityId[handState[cardIndex]];
  if (cardDef.cost > playerState.mp) {
    return state;
  }

  // Remove the card.
  handState.splice(cardIndex, 1);

  // Apply the card effect.
  if (cardDef.type == "mana") {
    playerState.maxMp++;
    playerState.manaThisTurn = true;
  }

  // Log the action.
  state.turnActions.push({
    type: "cast",
    actionEntityDefId: cardDef.entityId,
    tile: { q, r },
  });

  return state;
}

export function startGame(state: GameState) {
  // Draw 6 cards each.
  state = drawCards(state, 6, true);
  state = drawCards(state, 6, false);

  // Add a mana crystal and shuffle hands.
  state.hands.host = _.shuffle([...state.hands.host, "mana"]);
  state.hands.challenger = _.shuffle([...state.hands.challenger, "mana"]);

  return nextTurn(state);
}

export function nextTurn(state: GameState) {
  state.turn++;

  state.turnActions = [];

  // Draw a card unless its the first turn.
  if (state.turn > 1) {
    const isHostTurn = state.turn % 2 == 1;
    state = drawCards(state, 1, isHostTurn);
  }

  // Refresh entities.
  Object.values(state.entities).forEach((e) => {
    e.remainingActions = 1;
  });

  // Refresh players.
  Object.values(state.playerStates).forEach((p) => {
    p.mp = p.maxMp;
    p.manaThisTurn = false;
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

  state.turnActions.push({ type: "draw" });

  return state;
}
