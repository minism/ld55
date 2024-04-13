import gameConfig from "@/game/config/gameConfig";
import { IGameEvents } from "@/game/controller/IGameEvents";
import { GameModel } from "@/game/model/gameModel";
import { TooltipModel } from "@/game/model/tooltipModel";
import OverlayGrid from "@/game/renderer/OverlayGrid";
import Viewport from "@/game/renderer/Viewport";
import WorldTile from "@/game/renderer/WorldTile";
import { Application, Rectangle, Sprite } from "pixi.js";
import world from "../World";
import { getTexture, loadAllAssets } from "../assets";

let _renderer: GameRenderer | null = null;
export async function initGameRenderer(
  container: HTMLElement,
  handler: IGameEvents,
  tooltip: TooltipModel
) {
  if (_renderer != null) {
    console.warn("Not re-initializing GameRenderer, likely hot re loaded");
    return _renderer;
  }

  _renderer = new GameRenderer(handler, tooltip);
  await _renderer.init(container);
  return _renderer;
}

export default class GameRenderer {
  private readonly app: Application;
  private viewport: Viewport;

  private entityViews: Record<string, Sprite> = {};

  constructor(
    private readonly handler: IGameEvents,
    private readonly tooltip: TooltipModel
  ) {
    this.app = new Application();
    this.viewport = new Viewport(new Rectangle(0, 0, 0, 0), this.tooltip);
  }

  public async init(container: HTMLElement) {
    // BG Load stuff.
    const assetPromise = loadAllAssets();

    // Bootstrap the pixi app.
    await this.app.init({ background: "#311f11" });
    container.innerHTML = ""; // hot-reloading workaround
    container.appendChild(this.app.canvas);
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Setup the viewport/camera which serves as the base container.
    this.viewport = new Viewport(this.app.screen, this.tooltip);
    this.viewport.centerOn(0, 0);
    this.app.stage.addChild(this.viewport);

    // Stage events.
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
    this.app.stage.on("pointerdown", () => {
      if (this.viewport.hoveredWorldHex != null) {
        this.handler.handleClickWorldHex(this.viewport.hoveredWorldHex);
      }
    });

    // Start renderer.
    await assetPromise;
    for (const hex of world.grid) {
      new WorldTile(this.viewport.mainContainer, hex);
    }

    // Other components.
    new OverlayGrid(this.viewport.rawContainer);
  }

  public update(model: GameModel) {
    // Update entity rendering - retained-mode style.
    for (const [id, entity] of Object.entries(model.state.entities)) {
      // TODO: Handle destroy.
      if (!this.entityViews[id]) {
        this.entityViews[id] = new Sprite();
        this.viewport.mainContainer.addChild(this.entityViews[id]);
      }
      const view = this.entityViews[id];
      view.texture = getTexture(entity.type);
      view.anchor.set(0.5);
      const hex = world.grid.getHex([entity.tile.q, entity.tile.r]);
      if (hex != null) {
        view.position.x = hex.x;
        view.position.y = hex.y;
      } else {
        throw new Error(
          `Invalid tile for entity: (${entity.tile.q}, ${entity.tile.r}`
        );
      }
    }
  }

  private resize() {
    this.app.renderer.resize(
      window.innerWidth,
      window.innerHeight - gameConfig.gameViewVerticalPadding
    );
    this.viewport.centerOn(0, 0);
  }
}
