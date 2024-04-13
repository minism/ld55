import { Application, Rectangle, Sprite, Texture } from "pixi.js";
import { getAsset, getTexture, loadAllAssets } from "../assets";
import world from "../World";
import Viewport from "@/game/renderer/Viewport";
import OverlayGrid from "@/game/renderer/OverlayGrid";
import WorldTile from "@/game/renderer/WorldTile";
import gameConfig from "@/game/config/gameConfig";

let _initted = false;

export default class GameRenderer {
  private readonly app: Application;
  private viewport: Viewport;

  constructor() {
    this.app = new Application();
    this.viewport = new Viewport(new Rectangle(0, 0, 0, 0));
  }

  public async init(container: HTMLElement) {
    if (_initted) {
      throw new Error("Shouldn't have initted Game twice!");
    }

    // BG Load stuff.
    const assetPromise = loadAllAssets();

    // Bootstrap the pixi app.
    await this.app.init({ background: "#311f11" });
    container.innerHTML = ""; // hot-reloading workaround
    container.appendChild(this.app.canvas);
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Setup the viewport/camera which serves as the base container.
    this.viewport = new Viewport(this.app.screen);
    this.viewport.centerOn(0, 0);
    this.app.stage.addChild(this.viewport);

    // Viewport dragging.
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.eventMode = "static";
    this.app.stage.on(
      "pointerdown",
      this.viewport.handlePointerDown.bind(this.viewport)
    );
    this.app.stage.on(
      "pointerup",
      this.viewport.handlePointerUp.bind(this.viewport)
    );
    this.app.stage.on(
      "pointermove",
      this.viewport.handlePointerMove.bind(this.viewport)
    );

    // Start renderer.
    await assetPromise;
    for (const hex of world.grid) {
      new WorldTile(this.viewport.mainContainer, hex);
    }

    // Other components.
    new OverlayGrid(this.viewport.rawContainer);

    _initted = true;
  }

  private resize() {
    this.app.renderer.resize(
      window.innerWidth,
      window.innerHeight - gameConfig.gameViewVerticalPadding
    );
    this.viewport.centerOn(0, 0);
  }
}
