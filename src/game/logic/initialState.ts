import { CardSet, GameState } from "@/game/db/gameState";
import World from "@/game/model/World";
import { TileType } from "@/game/model/WorldTile";
import { randomIntBetween } from "@/game/util/math";
import { Hex, HexCoordinates, line, spiral } from "honeycomb-grid";
import _ from "lodash";
import { isDefined } from "../util/typescript";
import { addEntity } from "@/game/logic/stateMutations";
import gameConfig from "@/game/config/gameConfig";
import { DeckDef, standardDeck } from "@/game/data/deckDefs";

export function generateWorld() {
  // Use a tmp world for generation
  const world = new World();

  // Initialize all tiles to grass.
  world.setAllTiles(TileType.GRASS);

  // Generate some random tile areas using various traversers
  const hexes = _.chain(new Array(...world.grid))
    .filter(isDefined)
    .shuffle()
    .value();
  const randomStart = () => {
    const hex = hexes.pop()!;
    return [hex.q, hex.r] as HexCoordinates;
  };

  // Apply traversers.
  for (let i = 0; i < 10; i++) {
    const start = randomStart();
    const t = spiral({ start: randomStart(), radius: 10 });
    const limit = randomIntBetween(5, 20);
    world.updateTilesWithTraverser(t, limit, TileType.FOREST);

    for (let i = 0; i < 5; i++) {
      const direction = randomIntBetween(0, 8);
      const length = randomIntBetween(2, 5);

      // Use multiple traversers for line thickness.
      const t = line({ start, direction, length });
      world.updateTilesWithTraverser(
        t,
        randomIntBetween(8, 30),
        TileType.FOREST
      );
    }
  }
  for (let i = 0; i < 3; i++) {
    const t = spiral({ start: randomStart(), radius: 10 });
    const limit = randomIntBetween(15, 40);
    world.updateTilesWithTraverser(t, limit, TileType.WATER);
  }

  // Apply rotational symmetry.
  world.applyRotationalSymmetry();

  return world;
}

export function resolveDeck(deckDef: DeckDef) {
  const deck: CardSet = [];
  for (const cardDef of deckDef.cards) {
    for (let i = 0; i < cardDef.copies; i++) {
      deck.push(cardDef.cardEntityId);
    }
  }
  return deck;
}

export function initialGameState(): GameState {
  const world = generateWorld();

  let state: GameState = {
    turn: 0,
    playerStates: {
      host: {
        hp: gameConfig.maxPlayerHealth,
        maxHp: gameConfig.maxPlayerHealth,
        mp: 0,
        maxMp: 0,
      },
      challenger: {
        hp: gameConfig.maxPlayerHealth,
        maxHp: gameConfig.maxPlayerHealth,
        mp: 0,
        maxMp: 0,
      },
    },
    decks: {
      host: _.shuffle(resolveDeck(standardDeck)),
      challenger: _.shuffle(resolveDeck(standardDeck)),
    },
    hands: {
      host: [],
      challenger: [],
    },
    tiles: world.getAllTiles(),
    nextEntityId: 1,
    entities: {},
    turnActions: [],
  };

  // Place players on grass.
  const hostStart = world.findClosestTileType(
    new Hex([-5, 10]),
    TileType.GRASS
  );
  const challengerStart = world.findClosestTileType(
    new Hex([5, -10]),
    TileType.GRASS
  );
  state = addEntity(state, "wizard", {
    owner: true,
    tile: {
      q: hostStart.q,
      r: hostStart.r,
    },
  });
  state = addEntity(state, "wizard", {
    owner: false,
    tile: {
      q: challengerStart.q,
      r: challengerStart.r,
    },
  });

  return state;
}
