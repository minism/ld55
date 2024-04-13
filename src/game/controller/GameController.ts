import { apiMove } from "@/game/api";
import { IGameEvents } from "@/game/controller/IGameEvents";
import {
  fetchGameState,
  fetchPlayersForGame,
  provideSupabaseClient,
} from "@/game/db/db";
import { Game } from "@/game/db/types";
import { EventLog } from "@/game/model/eventLog";
import { GameModel } from "@/game/model/gameModel";
import { TooltipModel } from "@/game/model/tooltipModel";
import { initGameRenderer } from "@/game/renderer/GameRenderer";
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
  public model: GameModel | null = null;
  public readonly eventLog: EventLog;
  public readonly tooltip: TooltipModel;

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
    const renderer = await initGameRenderer(this.container, this, this.tooltip);
    this.eventLog.log("Initialized client view");
    autorun(() => {
      renderer.update(this.model!);
    });
    renderer.update(this.model);

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
  }

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
        this.eventLog.log(
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
        this.eventLog.log(
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
    this.eventLog.log(`Turn ${game.state.turn}`);
    this.model!.dbGame = game;
  }

  public async handleClickWorldHex(hex: Hex) {
    // TODO: Refactor this part
    const ourWizard = Object.values(this.model!.state.entities).find(
      (e) => e.type == "wizard" && e.owner == this.model!.areHost
    );
    if (ourWizard == null) {
      throw new Error("no wizard for player?");
    }

    await apiMove({
      gameId: this.clientProps.gameId,
      entityId: ourWizard.id,
      q: hex.q,
      r: hex.r,
    });
  }
}
