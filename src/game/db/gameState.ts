import { TilePosition, WorldTile } from "@/game/model/WorldTile";

// Shared game state, saved to DB.
export interface GameState {
  turn: number;
  tiles: WorldTile[];
  entities: Record<string, Entity>;
  nextEntityId: number;
}

export interface Entity {
  id: number;
  type: "wizard";
  tile: TilePosition;

  // Which player owns this entity. host = true, challenger = false
  owner: boolean;
}
