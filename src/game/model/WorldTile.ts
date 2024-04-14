export interface WorldTile {
  position: TilePosition;
  type: TileType;
}

export enum TileType {
  GRASS = 0,
  FOREST,
  WATER,
}

export interface TilePosition {
  q: number;
  r: number;
}
