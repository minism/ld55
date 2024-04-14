import { apiMove } from "@/game/api";
import { IGameEvents } from "@/game/controller/IGameEvents";
import { entityDefsById } from "@/game/data/entityDefs";
import {
  fetchGameState,
  fetchPlayersForGame as fetchUserProfilesForGame,
  provideSupabaseClient,
} from "@/game/db/db";
import { Entity } from "@/game/db/gameState";
import { DbGame } from "@/game/db/types";
import { TileType } from "@/game/model/WorldTile";
import { EventLog } from "@/game/model/eventLog";
import { GameModel } from "@/game/model/gameModel";
import { TooltipModel } from "@/game/model/tooltipModel";
import GameRenderer, { initGameRenderer } from "@/game/renderer/GameRenderer";
import { createClient } from "@/supabase/client";
import { RealtimeChannel, RealtimePresenceState } from "@supabase/supabase-js";
import { Hex } from "honeycomb-grid";
import { autorun, configure } from "mobx";
import _ from "lodash";

configure({
  enforceActions: "never",
});

// Invariants for the game client.
export interface GameClientProps {
  gameId: string;
  userId: string;
}

export class GameController implements IGameEvents {
  // @ts-expect-error: create a base state for this.
  public model: GameModel;
  public readonly eventLog: EventLog;
  public readonly tooltip: TooltipModel;

  private renderer: GameRenderer | null = null;
  private readonly presenceChannel: RealtimeChannel;
  private readonly dbChannel: RealtimeChannel;

  constructor(
    private readonly clientProps: GameClientProps,
    private readonly container: HTMLElement
  ) {
    const supabase = createClient();
    provideSupabaseClient(supabase);
    this.presenceChannel = supabase.channel(`game-${clientProps.gameId}`);
    this.dbChannel = supabase.channel("db-updates");

    // Create models
    this.eventLog = new EventLog();
    this.tooltip = new TooltipModel();
  }

  public async init() {
    // Init game state.
    const dbGame = await fetchGameState(this.clientProps.gameId);
    this.model = new GameModel(dbGame, this.clientProps.userId);

    // Init player state.
    const profiles = await fetchUserProfilesForGame(dbGame);
    this.model.provideUserProfiles(profiles);

    // Setup the renderer.
    this.renderer = await initGameRenderer(this.container, this);
    autorun(() => {
      this.renderer!.update(this.model!);
    });
    this.renderer.update(this.model);

    // Setup supabase realtime event listeners.
    this.presenceChannel
      .on("presence", { event: "sync" }, () => {
        this.handlePresenceSync(this.presenceChannel.presenceState());
      })
      .subscribe();

    this.dbChannel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game",
          filter: `id=eq.${this.clientProps.gameId}`,
        },
        (payload) => {
          // Typing issue here but it should be the same
          // @ts-expect-error
          this.handleDbGameUpdate(payload.new);
        }
      )
      .subscribe();

    // Player init logic.
    this.presenceChannel.track({
      userId: this.clientProps.userId,
    });

    // Initial status message.
    if (this.model.hasGameStarted()) {
      this.log(`Continuing game at turn ${this.model.state.turn}`);
    } else {
      this.log("Waiting for another player to join...");
    }
  }

  private log(...args: Parameters<(typeof EventLog)["prototype"]["log"]>) {
    this.eventLog.log(...args);
  }

  /**
   * Private logic routines
   */

  private selectEntity(entity: Entity) {
    this.model.selectedEntity = entity;
    this.model.availableMoves = [];
    const def = entityDefsById[entity.def];

    // Update available moves.
    if (entity.remainingActions > 0) {
      // Start with traversable tiles.
      const availableTiles = _.chain(
        this.model.world.findNeighborsMatching(
          new Hex(entity.tile),
          def.moveSpeed,
          new Set([TileType.GRASS, TileType.FOREST])
        )
      )
        // Filter out occupied spaces.
        .filter((hex) => !this.model.hasEntityForHex(hex))
        .value();
      this.model.availableMoves = availableTiles;
    }
  }

  /**
   * EVENTS
   */

  private async handlePresenceSync(presenceState: RealtimePresenceState<any>) {
    if (this.model == null) {
      throw new Error("Must init game state before supabase presence");
    }

    // Update player connection status.
    const connectedPlayers = new Set();
    for (const presenceList of Object.values(presenceState)) {
      if (presenceList.length != 1) {
        console.log("Presence list different than 1");
        console.dir(presenceList);
      } else {
        const state = presenceList[0];
        connectedPlayers.add(state.userId);
      }
    }

    if (this.model.host) {
      const connected = connectedPlayers.has(this.model.host.profile.id);
      if (connected != this.model.host.connected) {
        this.log(
          `${this.model.host.profile.username} ${
            connected ? "connected" : "disconnected"
          }`
        );
        this.model.host = {
          ...this.model.host,
          connected,
        };
      }
    }

    if (this.model.challenger) {
      const connected = connectedPlayers.has(this.model.challenger.profile.id);
      if (connected != this.model.challenger.connected) {
        this.log(
          `${this.model.challenger.profile.username} ${
            connected ? "connected" : "disconnected"
          }`
        );
        this.model.challenger = {
          ...this.model.challenger,
          connected,
        };
      }
    }
  }

  private async handleDbGameUpdate(game: DbGame) {
    const lastTurn = this.model.dbGame.state.turn;
    const lastChallengerId = this.model.dbGame.challenger_id;
    this.model.dbGame = game;

    if (game.state.turn > lastTurn) {
      const player = this.model.playerForTurn();
      this.log("");
      this.log(`[Turn ${game.state.turn} - ${player?.profile.username}]`);
    }

    if (game.challenger_id != lastChallengerId) {
      const profiles = await fetchUserProfilesForGame(game);
      this.model.provideUserProfiles(profiles);
    }
  }

  public async handleShowHexTooltip(hex: Hex) {
    if (this.renderer == null) {
      return;
    }
    this.tooltip.visible = true;
    const pos = this.renderer.getScreenPositionForHex(hex);
    this.tooltip.positionX = pos.x;
    this.tooltip.positionY = pos.y;

    this.tooltip.tile = this.model.world.getTile(hex);
    this.tooltip.entities = this.model.getEntitiesForHex(hex);
  }

  public handleHideTooltip() {
    this.tooltip.visible = false;
  }

  public async handleClickWorldHex(hex: Hex) {
    // Ensure we always clear the selection.
    const selectedEntity = this.model.selectedEntity;
    this.model.selectedEntity = null;

    // No actions if its not our turn.
    if (!this.model.isOurTurn()) {
      this.model.selectedEntity = null;
      return;
    }

    // If we have available moves, try moving.
    if (
      selectedEntity != null &&
      selectedEntity.remainingActions > 0 &&
      this.model.availableMoves.find((h) => h.equals(hex))
    ) {
      return await apiMove({
        gameId: this.model.dbGame.id,
        entityId: selectedEntity.id,
        q: hex.q,
        r: hex.r,
      });
    }

    // Lookup the entity.
    // TODO: Handle multiple entities.
    const entities = this.model.getEntitiesForHex(hex);
    if (entities.length < 1) {
      return;
    }

    const entity = entities[0];
    if (!this.model.ownsEntity(entity)) {
      // Ignore clicks on other entities for now.
      return;
    }

    this.selectEntity(entity);
  }
}
