import { Application, Sprite } from "pixi.js";
import { getAsset, loadAllAssetsBackground } from "./assets";

export default class Game {
  constructor() {}

  public async init(container: HTMLElement) {
    await loadAllAssetsBackground();

    const app = new Application();
    await app.init({ background: "#000000", resizeTo: container });
    container.innerHTML = ""; // hot-reloading workaround
    container.appendChild(app.canvas);

    const tex = await getAsset("flower");
    const spr = new Sprite(tex);
    app.stage.addChild(spr);
  }
}
