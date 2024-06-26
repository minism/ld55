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
  turnActions: TurnAction[];

  // Private player state which should eventually be secured.
  winner: boolean | null;
  decks: {
    host: CardSet;
    challenger: CardSet;
  };
  hands: {
    host: CardSet;
    challenger: CardSet;
  };
  summons: {
    entityDefId: string;
    owner: boolean;
    tile: TilePosition;
  }[];
}

export interface Entity {
  id: number;
  def: string;
  tile: TilePosition;
  hp: number;
  remainingMoves: number;
  remainingAttacks: number;

  // Which player owns this entity. host = true, challenger = false
  owner: boolean;
}

export interface PlayerState {
  hp: number;
  mp: number;
  maxHp: number;
  maxMp: number;
  manaThisTurn?: boolean;
}

export interface TurnAction {
  type: "draw" | "cast" | "attack" | "kill";
  actionEntityDefId?: string;
  targetEntityDefId?: string;
  actionEntityId?: number;
  targetEntityId?: number;
  tile?: TilePosition;
}

// Cards referenced by entity IDs.
export type CardSet = string[];
