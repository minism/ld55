import { Entity } from "@/game/db/gameState";
import { Game, UserProfile } from "@/game/db/types";
import World from "@/game/model/World";
import { Hex } from "honeycomb-grid";
import _ from "lodash";
import { makeAutoObservable } from "mobx";

// Client game state representation.
// For now we use makeAutoObserverable which is least code and also least
// performant, but good to start with.
export class GameModel {
  // Client view of shared state, may be computed.
  dbGame: Game;
  world: World;
  host: Player | null = null;
  challenger: Player | null = null;

  // Client-only state.
  readonly ourUserId: string;
  selectedEntity: Entity | null = null;
  availableMoves: Hex[] = [];

  constructor(dbGame: Game, ourUserId: string) {
    this.dbGame = dbGame;
    this.ourUserId = ourUserId;
    this.world = new World();
    this.world.setTiles(dbGame.state.tiles);

    makeAutoObservable(this);
  }

  get state() {
    return this.dbGame.state;
  }

  playerForTurn() {
    const hostsTurn = this.state.turn % 2 == 0;
    return hostsTurn ? this.host : this.challenger;
  }

  isOurTurn() {
    const hostsTurn = this.state.turn % 2 == 0;
    return (
      this.hasGameStarted() &&
      ((hostsTurn && this.areHost()) || (!hostsTurn && this.areChallenger()))
    );
  }

  ownsEntity(entity: Entity) {
    return (
      (this.areHost() && entity.owner) ||
      (this.areChallenger() && !entity.owner)
    );
  }

  areHost() {
    return this.dbGame.host_id == this.ourUserId;
  }

  areChallenger() {
    return this.dbGame.challenger_id == this.ourUserId;
  }

  areSpectator() {
    return !this.areHost() && !this.areChallenger();
  }

  hasGameStarted() {
    return this.dbGame.challenger_id != null;
  }

  getEntitiesForHex(hex: Hex) {
    // TODO: Could optimize this but I doubt it will matter.
    return _.chain(this.state.entities)
      .values()
      .filter((e) => e.tile.q == hex.q && e.tile.r == hex.r)
      .value();
  }

  hasEntityForHex(hex: Hex) {
    return this.getEntitiesForHex(hex).length > 0;
  }
}

export interface Player {
  profile: UserProfile;
  connected: boolean;
}
