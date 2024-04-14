import { GameState } from "@/game/db/gameState";
import { Game, UserProfile } from "@/game/db/types";
import World from "@/game/model/World";
import { Hex } from "honeycomb-grid";
import { makeAutoObservable } from "mobx";
import _ from "lodash";

// Client game state representation.
// For now we use makeAutoObserverable which is least code and also least
// performant, but good to start with.
export class GameModel {
  world: World;
  host: Player | null = null;
  challenger: Player | null = null;

  constructor(public dbGame: Game, public readonly ourUserId: string) {
    this.world = new World();
    this.world.setTiles(dbGame.state.tiles);

    makeAutoObservable(this);
  }

  get state() {
    return this.dbGame.state;
  }

  get areHost() {
    return this.dbGame.host_id == this.ourUserId;
  }

  getEntitiesForHex(hex: Hex) {
    // TODO: Could optimize this but I doubt it will matter.
    return _.chain(this.state.entities)
      .values()
      .filter((e) => e.tile.q == hex.q && e.tile.r == hex.r)
      .value();
  }
}

export interface Player {
  profile: UserProfile;
  connected: boolean;
}
