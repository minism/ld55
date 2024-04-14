import { TilePosition, WorldTile } from "@/game/model/WorldTile";

// Shared game state, saved to DB.
export interface GameState {
  turn: number;
  tiles: WorldTile[];
  entities: Record<string, Entity>;
  nextEntityId: number;
  playerStates: {
    host: PlayerState;
    challenger: PlayerState;
  };

  // Private player state which should eventually be secured.
}

export interface Entity {
  id: number;
  def: string;
  type: "wizard" | "summon";
  tile: TilePosition;

  remainingActions: number;

  // Which player owns this entity. host = true, challenger = false
  owner: boolean;
}

export interface PlayerState {
  hp: number;
  mp: number;
}
