import { Application } from "pixi.js";

export default class Game {
  constructor() {}

  public async init(container: HTMLElement) {
    const app = new Application();
    await app.init({ background: "#cc0000", resizeTo: container });
    container.appendChild(app.canvas);
  }
}
