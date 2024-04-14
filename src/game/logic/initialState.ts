import { GameState } from "@/game/db/gameState";
import World from "@/game/model/World";
import { TileType } from "@/game/model/WorldTile";

function generateMapTiles(): GameState["tiles"] {
  // Use a tmp world for generation
  const world = new World();

  // Initialize all tiles to grass.
  world.setAllTiles(TileType.GRASS);
  world.setTile(world.grid.getHex({ q: 0, r: 0 })!, TileType.FOREST);

  // Generate some random tile patches using spiral traverser.
  // TODO: Try other traversers like "walks"
  // const hexes = _.chain(new Array(world.grid)).shuffle().value();
  // for (let i = 0; i < gameConfig.generation.numForestPatches; i++) {
  //   const size = randomIntBetween(
  //     gameConfig.generation.forestPatchSizeMin,
  //     gameConfig.generation.forestPatchSizeMax + 1
  //   );

  //   const start = hex;
  // }

  return world.getAllTiles();
}

export function initialGameState(): GameState {
  return {
    turn: 0,
    tiles: generateMapTiles(),
    entities: {
      "1": {
        id: 1,
        type: "wizard",
        tile: {
          q: 4,
          r: -8,
        },
        owner: true,
      },
      "2": {
        id: 2,
        type: "wizard",
        tile: {
          q: -4,
          r: 8,
        },
        owner: false,
      },
    },
  };
}
