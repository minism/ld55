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
  decks: {
    host: CardSet;
    challenger: CardSet;
  };
  hands: {
    host: CardSet;
    challenger: CardSet;
  };
}

export interface Entity {
  id: number;
  def: string;
  tile: TilePosition;
  hp: number;
  remainingActions: number;

  // Which player owns this entity. host = true, challenger = false
  owner: boolean;
}

export interface PlayerState {
  hp: number;
  mp: number;
}

// Cards referenced by entity IDs.
export type CardSet = string[];
