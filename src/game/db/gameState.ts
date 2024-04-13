// Shared game state, saved to DB.
export interface GameState {
  turn: number;
  entities: Record<string, Entity>;
}

export interface Entity {
  id: number;
  type: "wizard";
  tile: TilePosition;

  // Which player owns this entity. host = true, challenger = false
  owner: boolean;
}

export interface TilePosition {
  q: number;
  r: number;
}

export function initialGameState(): GameState {
  return {
    turn: 0,
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
