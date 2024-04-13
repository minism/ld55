import GameRenderer from "@/game/renderer/GameRenderer";

let _initted = false;

export default class GameController {
  constructor(private readonly container: HTMLElement) {}

  public async init() {
    if (_initted) {
      throw new Error("Shouldn't have initted GameController twice!");
    }

    const renderer = new GameRenderer();
    await renderer.init(this.container);
  }
}
