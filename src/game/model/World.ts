import gameConfig from "@/game/config/gameConfig";
import { TileType, WorldTile } from "@/game/model/WorldTile";
import {
  Grid,
  Hex,
  Orientation,
  Traverser,
  defineHex,
  spiral,
} from "honeycomb-grid";

const GameHex = defineHex({
  dimensions: { width: 16, height: 16 },
  orientation: Orientation.POINTY,
  origin: { x: 0, y: 0 },
  offset: -1,
});

// Create a hex-shaped map using spiral traverser.
export const worldGrid = new Grid(
  GameHex,
  spiral({
    start: [0, 0],
    radius: gameConfig.generation.worldSize,
  })
);

// Hex grid world representation.
export default class World {
  public readonly grid: Grid<Hex>;

  private readonly radius: number;
  private readonly tiles: Record<string, WorldTile> = {};

  constructor() {
    // Create a hex-shaped map using spiral traverser.
    this.radius = gameConfig.generation.worldSize;
    this.grid = worldGrid;

    this.grid.forEach(
      (h) =>
        (this.tiles[World.key(h)] = {
          position: {
            q: h.q,
            r: h.r,
          },
          type: TileType.GRASS,
        })
    );
  }

  updateTilesWithTraverser(
    traverser: Traverser<Hex>,
    limit: number,
    tileType: TileType
  ) {
    const iter = this.grid.traverse(traverser);
    let i = 0;
    for (const hex of iter) {
      if (i++ > limit) {
        return;
      }

      this.setTile(hex, tileType);
    }
  }

  setAllTiles(tileType: TileType) {
    this.grid.forEach((h) => (this.tiles[World.key(h)].type = tileType));
  }

  setTiles(tiles: WorldTile[]) {
    for (const tile of tiles) {
      this.setTile(new Hex({ ...tile.position }), tile.type);
    }
  }

  setTile(hex: Hex, tileType: TileType) {
    this.tiles[World.key(hex)].type = tileType;
  }

  getTile(hex: Hex) {
    return this.tiles[World.key(hex)];
  }

  getAllTiles() {
    return Object.values(this.tiles);
  }

  copyTile(from: Hex, to: Hex) {
    this.setTile(to, this.getTile(from).type);
  }

  findClosestTileType(start: Hex, tileType: TileType) {
    for (const hex of this.allNeighbors(start, this.radius)) {
      if (this.getTile(hex).type == tileType) {
        return hex;
      }
    }
    throw new Error("Unable to find a closest tile type!");
  }

  findNeighborsMatching(start: Hex, radius: number, tileTypes: Set<TileType>) {
    const ret = new Array<Hex>();
    for (const hex of this.allNeighbors(start, radius)) {
      if (hex.equals(start)) {
        continue;
      }
      if (tileTypes.has(this.getTile(hex).type)) {
        ret.push(hex);
      }
    }
    return ret;
  }

  allNeighbors(start: Hex, radius: number) {
    const ret = new Array<Hex>();
    for (const hex of this.grid.traverse(
      spiral({
        start,
        radius: radius,
      })
    )) {
      ret.push(hex);
    }
    return ret;
  }

  applyRotationalSymmetry() {
    let test = 0;
    for (const hex of this.grid) {
      // Reflect the bottom half only.
      if (hex.y < 0) {
        continue;
      }

      const reflectedCoords = {
        x: -hex.x,
        y: -hex.y,
      };
      const reflectedHex = this.grid.pointToHex(reflectedCoords);
      this.copyTile(hex, reflectedHex);
    }
  }

  static key(hex: { q: number; r: number }) {
    return `${hex.q}:${hex.r}`;
  }
}

// Use an empty world to init stuff, but this is a little messy, better would
// be an actual empty game state.
// TODO: Eliminate this in favor of worldGrid
export const emptyWorld = new World();
