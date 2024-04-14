import { EntityDef } from "@/game/data/entityDefs";
import { Entity } from "@/game/db/gameState";
import { DbGame, UserProfile } from "@/game/db/types";
import {
  attackEntity,
  castCard,
  moveEntity,
  summonEntity,
} from "@/game/logic/stateMutations";
import World from "@/game/model/World";
import { Hex } from "honeycomb-grid";
import _ from "lodash";
import { makeAutoObservable } from "mobx";

// Client game state representation.
// For now we use makeAutoObserverable which is least code and also least
// performant, but good to start with.
export class GameModel {
  // Client view of shared state, may be computed.
  dbGame: DbGame;
  world: World;
  host: Player | null = null;
  challenger: Player | null = null;

  // Client-only state.
  readonly ourUserId: string;
  selectedCardIndex: number = -1;
  selectedEntity: Entity | null = null;
  selectedSummon: EntityDef | null = null;
  selectedSpell: EntityDef | null = null;
  availableActionLocations: Hex[] = []; // Relevant for move/summon/cast.
  availableAttackLocations: Hex[] = [];
  flashMessage: string = "";

  constructor(dbGame: DbGame, ourUserId: string) {
    this.dbGame = dbGame;
    this.ourUserId = ourUserId;
    this.world = new World();
    this.world.setTiles(dbGame.state.tiles);

    makeAutoObservable(this);
  }

  get state() {
    return this.dbGame.state;
  }

  get persistentMessage() {
    if (this.selectedSummon != null) {
      return "Select a location to summon";
    } else if (this.selectedSpell != null) {
      return "Select a location to cast";
    }
    return "";
  }

  provideUserProfiles(profiles: UserProfile[]) {
    const host = profiles.find((p) => p.id == this.dbGame.host_id);
    const challenger = profiles.find((p) => p.id == this.dbGame.challenger_id);
    if (this.host == null && host != null) {
      this.host = {
        connected: false,
        profile: host,
      };
    }
    if (this.challenger == null && challenger != null) {
      this.challenger = {
        connected: false,
        profile: challenger,
      };
    }
  }

  playerForTurn() {
    const hostsTurn = this.state.turn % 2 == 1;
    return hostsTurn ? this.host : this.challenger;
  }

  opponentForTurn() {
    const hostsTurn = this.state.turn % 2 == 1;
    return hostsTurn ? this.challenger : this.host;
  }

  isOurTurn() {
    const hostsTurn = this.state.turn % 2 == 1;
    return (
      this.hasGameStarted() &&
      ((hostsTurn && this.areHost()) || (!hostsTurn && this.areChallenger()))
    );
  }

  getOurHand() {
    return this.areHost()
      ? this.state.hands.host
      : this.areChallenger()
      ? this.state.hands.challenger
      : [];
  }

  getOurPlayerState() {
    return this.areHost()
      ? this.state.playerStates.host
      : this.state.playerStates.challenger;
  }

  getOurWizard() {
    return _.chain(this.state.entities)
      .values()
      .filter((e) => e.def == "wizard" && e.owner == this.areHost())
      .first()
      .value();
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

  getSummonsForHex(hex: Hex) {
    // TODO: Could optimize this but I doubt it will matter.
    return _.chain(this.state.summons)
      .filter((s) => s.tile.q == hex.q && s.tile.r == hex.r)
      .value();
  }

  hasEntityForHex(hex: Hex) {
    return this.getEntitiesForHex(hex).length > 0;
  }

  hasSummonForHex(hex: Hex) {
    return this.getSummonsForHex(hex).length > 0;
  }

  // Clientside prediction routines.

  predictAttack(entityId: number, q: number, r: number) {
    // @ts-expect-error
    this.dbGame.state = attackEntity(this.dbGame.state, entityId, q, r);
  }

  predictMove(entityId: number, q: number, r: number) {
    // @ts-expect-error
    this.dbGame.state = moveEntity(this.dbGame.state, entityId, q, r);
  }

  predictSummon(entityDefId: string, q: number, r: number) {
    // @ts-expect-error
    this.dbGame.state = summonEntity(this.dbGame.state, entityDefId, q, r);
  }

  predictCast(cardIndex: number, q: number, r: number) {
    // @ts-expect-error
    this.dbGame.state = castCard(this.dbGame.state, cardIndex, q, r);
  }
}

export interface Player {
  profile: UserProfile;
  connected: boolean;
}
