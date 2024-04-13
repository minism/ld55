import { Application, Sprite } from "pixi.js";
import { getAsset, loadAllAssetsBackground } from "./assets";
import world from "./World";

export default class Game {
  constructor() {}

  public async init(container: HTMLElement) {
    await loadAllAssetsBackground();

    const app = new Application();
    await app.init({ background: "#000000", resizeTo: container });
    container.innerHTML = ""; // hot-reloading workaround
    container.appendChild(app.canvas);

    const tex = await getAsset("flower");

    for (const hex of world.grid) {
      const spr = new Sprite(tex);
      spr.x = hex.x;
      spr.y = hex.y;
      app.stage.addChild(spr);
    }
  }
}
