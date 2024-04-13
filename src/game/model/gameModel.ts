import { GameState } from "@/game/db/gameState";
import { Game, UserProfile } from "@/game/db/types";
import { makeAutoObservable } from "mobx";

// Client game state representation.
// For now we use makeAutoObserverable which is least code and also least
// performant, but good to start with.
export class GameModel {
  host: Player | null = null;
  challenger: Player | null = null;

  get state() {
    return this.dbGame.state;
  }

  get areHost() {
    return this.dbGame.host_id == this.ourUserId;
  }

  constructor(public dbGame: Game, public readonly ourUserId: string) {
    makeAutoObservable(this);
  }
}

export interface Player {
  profile: UserProfile;
  connected: boolean;
}
