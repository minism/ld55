import { Application, Sprite, Texture } from "pixi.js";
import { getAsset, getTexture, loadAllAssetsBackground } from "./assets";
import world from "./World";
import Viewport from "@/game/renderer/Viewport";

export default class Game {
  constructor() {}

  public async init(container: HTMLElement) {
    // BG Load stuff.
    await loadAllAssetsBackground();

    // Bootstrap the pixi app.
    const app = new Application();
    await app.init({ background: "#002510", resizeTo: container });
    container.innerHTML = ""; // hot-reloading workaround
    container.appendChild(app.canvas);

    // Setup stage / renderer.
    // app.stage.scale = 3;

    // Setup the viewport/camera which serves as the base container.
    const viewport = new Viewport(app.screen);
    app.stage.addChild(viewport);

    // TEST
    const tex = await getTexture("hexBase");

    for (const hex of world.grid) {
      const spr = new Sprite(tex);
      spr.x = hex.x;
      spr.y = hex.y;
      viewport.addChild(spr);
    }
  }
}
