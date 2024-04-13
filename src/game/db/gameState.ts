// Shared game state, saved to DB.
export interface GameState {
  wizards: Entity[];
  entities: Entity[];
}

export interface Entity {
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
    entities: [],
    wizards: [
      {
        type: "wizard",
        tile: {
          q: 4,
          r: -8,
        },
        owner: true,
      },
      {
        type: "wizard",
        tile: {
          q: -4,
          r: 8,
        },
        owner: false,
      },
    ],
  };
}
