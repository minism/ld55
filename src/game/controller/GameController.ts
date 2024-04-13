import { fetchGameState } from "@/game/db/db";
import GameRenderer, { initGameRenderer } from "@/game/renderer/GameRenderer";
import { createClient } from "@/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

// Invariants for the game client.
export interface GameClientProps {
  gameId: string;
  userId: string;
}

export class GameController {
  private readonly presenceChannel: RealtimeChannel;

  constructor(
    private readonly clientProps: GameClientProps,
    private readonly container: HTMLElement
  ) {
    const supabase = createClient();
    this.presenceChannel = supabase.channel(`game-${clientProps.gameId}`);

    // Setup supabase realtime event listeners.
    this.presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = this.presenceChannel.presenceState();
        console.log("sync", state);
      })

      // We may be able to eliminate join/leave events if sync is sufficient.
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        // console.log("join", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        // console.log("leave", key, leftPresences);
      })
      .subscribe();

    // TODO: Setup postgres listeners here.
  }

  public async init() {
    // Load game state.
    const game = await fetchGameState(this.clientProps.gameId);
    console.dir(game);

    // Player init logic.
    this.presenceChannel.track({
      userId: this.clientProps.userId,
    });

    // Setup the renderer.
    const renderer = await initGameRenderer(this.container);
  }
}
