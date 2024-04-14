import { apiMove } from "@/game/api";
import { IGameEvents } from "@/game/controller/IGameEvents";
import {
  fetchGameState,
  fetchPlayersForGame,
  provideSupabaseClient,
} from "@/game/db/db";
import { Entity } from "@/game/db/gameState";
import { Game } from "@/game/db/types";
import { TileType } from "@/game/model/WorldTile";
import { EventLog } from "@/game/model/eventLog";
import { GameModel } from "@/game/model/gameModel";
import { TooltipModel } from "@/game/model/tooltipModel";
import GameRenderer, { initGameRenderer } from "@/game/renderer/GameRenderer";
import { createClient } from "@/supabase/client";
import { RealtimeChannel, RealtimePresenceState } from "@supabase/supabase-js";
import { Hex } from "honeycomb-grid";
import { configure, reaction, autorun } from "mobx";

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
    const { host, challenger } = await fetchPlayersForGame(dbGame);
    this.model.host = {
      profile: host,
      connected: false,
    };
    if (challenger != null) {
      this.model.challenger = {
        profile: challenger,
        connected: false,
      };
    }

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
    this.log("Selected " + entity.id);
    this.model.selectedEntity = entity;

    // Update available moves.
    if (entity.remainingActions > 0) {
      const availableTiles = this.model.world.findNeighborsMatching(
        new Hex(entity.tile),
        1,
        new Set([TileType.GRASS, TileType.FOREST])
      );
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

  private async handleDbGameUpdate(game: Game) {
    this.log(`Turn ${game.state.turn}`);
    this.model.dbGame = game;
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
    this.model.selectedEntity = null;

    if (!this.model.isOurTurn()) {
      return;
    }

    const entities = this.model.getEntitiesForHex(hex);
    // TODO: Handle multiple entities.
    if (entities.length < 1) {
      return;
    }

    const entity = entities[0];
    if (!this.model.ownsEntity(entity)) {
      // Ignore clicks on other entities for now.
      return;
    }

    this.selectEntity(entity);

    // const entity = Object.values(this.model.state.entities).find((e) =>
    //   this.model.ownsEntity(e)
    // );
    // console.dir(entity);
    // if (entity == null) {
    //   return;
    // }

    // await apiMove({
    //   gameId: this.clientProps.gameId,
    //   entityId: entity.id,
    //   q: hex.q,
    //   r: hex.r,
    // });
  }
}
