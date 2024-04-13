import GameRenderer from "@/game/renderer/GameRenderer";
import { createClient } from "@/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

let _initted = false;

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
  }

  public async init() {
    if (_initted) {
      throw new Error("Shouldn't have initted GameController twice!");
    }

    // Setup the renderer.
    const renderer = new GameRenderer();
    await renderer.init(this.container);

    // Player init logic.
    this.presenceChannel.track({
      userId: this.clientProps.userId,
    });
  }
}
