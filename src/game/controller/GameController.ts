import {
  fetchGameState,
  fetchPlayersForGame,
  provideSupabaseClient,
} from "@/game/db/db";
import { EventLog } from "@/game/model/eventLog";
import { GameState } from "@/game/model/gameState";
import { initGameRenderer } from "@/game/renderer/GameRenderer";
import { createClient } from "@/supabase/client";
import { RealtimeChannel, RealtimePresenceState } from "@supabase/supabase-js";

// Invariants for the game client.
export interface GameClientProps {
  gameId: string;
  userId: string;
}

export class GameController {
  public state: GameState | null = null;
  public readonly eventLog: EventLog;

  private readonly presenceChannel: RealtimeChannel;

  constructor(
    private readonly clientProps: GameClientProps,
    private readonly container: HTMLElement
  ) {
    const supabase = createClient();
    provideSupabaseClient(supabase);
    this.presenceChannel = supabase.channel(`game-${clientProps.gameId}`);

    this.eventLog = new EventLog();
  }

  public async init() {
    // Init game state.
    const dbGame = await fetchGameState(this.clientProps.gameId);
    this.state = new GameState(dbGame);

    // Init player state.
    const { host, challenger } = await fetchPlayersForGame(dbGame);
    this.state.host = {
      profile: host,
      connected: false,
    };
    if (challenger != null) {
      this.state.challenger = {
        profile: challenger,
        connected: false,
      };
    }

    // Setup the renderer.
    const renderer = await initGameRenderer(this.container);
    this.eventLog.log("Initialized client view");

    // Setup supabase realtime event listeners.
    this.presenceChannel
      .on("presence", { event: "sync" }, () => {
        this.handlePresenceSync(this.presenceChannel.presenceState());
      })
      .subscribe();

    // Player init logic.
    this.presenceChannel.track({
      userId: this.clientProps.userId,
    });
  }

  private async handlePresenceSync(presenceState: RealtimePresenceState<any>) {
    if (this.state == null) {
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

    if (this.state.host) {
      const connected = connectedPlayers.has(this.state.host.profile.id);
      if (connected != this.state.host.connected) {
        this.eventLog.log(
          `${this.state.host.profile.username} ${
            connected ? "connected" : "disconnected"
          }`
        );
        this.state.host = {
          ...this.state.host,
          connected,
        };
      }
    }

    if (this.state.challenger) {
      const connected = connectedPlayers.has(this.state.challenger.profile.id);
      if (connected != this.state.challenger.connected) {
        this.eventLog.log(
          `${this.state.challenger.profile.username} ${
            connected ? "connected" : "disconnected"
          }`
        );
        this.state.challenger = {
          ...this.state.challenger,
          connected,
        };
      }
    }
  }
}
