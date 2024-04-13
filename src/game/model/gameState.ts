import { Game, UserProfile } from "@/game/db/types";
import { makeAutoObservable } from "mobx";

// Client game state representation.
// For now we use makeAutoObserverable which is least code and also least
// performant, but good to start with.
export class GameState {
  host: Player | null = null;
  challenger: Player | null = null;

  constructor(public dbGame: Game) {
    makeAutoObservable(this);
  }
}

export interface Player {
  profile: UserProfile;
  connected: boolean;
}
