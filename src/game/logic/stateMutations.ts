import { cardDefsByEntityId } from "@/game/data/cardDefs";
import { entityDefsById } from "@/game/data/entityDefs";
import { Entity, GameState } from "@/game/db/gameState";
import { TilePosition } from "@/game/model/WorldTile";
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
    remainingMoves: 1,
    remainingAttacks: 1,
    def: defId,
    hp: def.hp,
    ...data,
  };
  return state;
}

export function removeEntity(state: GameState, entityId: number) {
  delete state.entities[entityId];
  return state;
}

export function attackEntity(
  state: GameState,
  entityId: string,
  q: number,
  r: number
) {
  // TODO: Check owner.
  const entity = state.entities[entityId];
  const def = entityDefsById[entity.def];
  if (entity.remainingAttacks < 1) {
    return state;
  }

  const target = entityForTile(state, q, r);
  if (target == null) {
    return;
  }

  target.hp -= def.attack;
  entity.remainingAttacks--;

  state.turnActions.push({
    type: "attack",
    actionEntityDefId: entity.def,
    targetEntityDefId: target.def,
    tile: { q, r },
  });

  // Check death.
  if (target.hp < 1) {
    state = killEntity(state, target.id);
  }

  // TODO: Check win-con.

  return state;
}

export function moveEntity(
  state: GameState,
  entityId: string,
  q: number,
  r: number
) {
  // TODO: Check owner.
  const entity = state.entities[entityId];
  if (entity.remainingMoves < 1) {
    return state;
  }

  const occupant = entityForTile(state, q, r);
  if (occupant != null) {
    return state;
  }

  entity.tile = { q, r };
  entity.remainingMoves--;

  // state.turnActions.push({
  //   type: "move",
  //   actionEntityId: entityId,
  //   tile: { q, r },
  // });

  return state;
}

export function killEntity(state: GameState, entityId: number) {
  const entity = state.entities[entityId];
  state.turnActions.push({
    type: "kill",
    targetEntityDefId: entity.def,
  });
  delete state.entities[entityId];
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
    if (playerState.manaThisTurn) {
      return state;
    }
    playerState.maxMp++;
    playerState.mp++;
    playerState.manaThisTurn = true;
  } else if (cardDef.type == "summon") {
    state = summonEntity(state, cardDef.entityId, q, r);
  }

  // Log the action.
  state.turnActions.push({
    type: "cast",
    actionEntityDefId: cardDef.entityId,
    tile: { q, r },
  });

  return state;
}

export function summonEntity(
  state: GameState,
  entityDefId: string,
  q: number,
  r: number
) {
  const tile = { q, r };
  const owner = state.turn % 2 == 1;
  state.summons.push({
    entityDefId,
    owner,
    tile,
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

  const isHostTurn = state.turn % 2 == 1;

  // Draw a card unless its the first turn.
  if (state.turn > 1) {
    const isHostTurn = state.turn % 2 == 1;
    state = drawCards(state, 1, isHostTurn);
  }

  // Cull any dead entities, stopgap for bugs.
  for (const entity of Object.values(state.entities)) {
    if (entity.hp < 1) {
      state = killEntity(state, entity.id);
    }
  }

  // Refresh entities.
  Object.values(state.entities).forEach((e) => {
    e.remainingMoves = 1;
    e.remainingAttacks = 1;
  });

  // Refresh players.
  Object.values(state.playerStates).forEach((p) => {
    p.mp = p.maxMp;
    p.manaThisTurn = false;
  });

  // Resolve summons.
  for (let i = state.summons.length - 1; i >= 0; i--) {
    const summon = state.summons[i];
    if (summon.owner == isHostTurn) {
      state = addEntity(state, summon.entityDefId, {
        ...summon,
      });
      state.summons.splice(i, 1);
    }
  }

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

function entityForTile(state: GameState, q: number, r: number) {
  return Object.values(state.entities).find(
    (e) => e.tile.q == q && e.tile.r == r
  );
}
