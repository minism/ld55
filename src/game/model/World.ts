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

// Hex grid world representation.
export default class World {
  public readonly grid: Grid<Hex>;

  private readonly tiles: Record<string, WorldTile> = {};

  constructor() {
    // Create a hex-shaped map using spiral traverser.
    const radius = gameConfig.generation.worldSize;
    this.grid = new Grid(
      GameHex,
      spiral({
        start: [0, 0],
        radius,
      })
    );

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

  static key(hex: { q: number; r: number }) {
    return `${hex.q}:${hex.r}`;
  }
}

// Use an empty world to init stuff, but this is a little messy, better would
// be an actual empty game state.
export const emptyWorld = new World();
