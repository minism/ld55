import { loadAllAssets } from "@/game/assets";
import gameConfig from "@/game/config/gameConfig";
import { IGameEvents } from "@/game/controller/IGameEvents";
import World, { emptyWorld, worldGrid } from "@/game/model/World";
import { GameModel } from "@/game/model/gameModel";
import AvailableAttackIndicator from "@/game/renderer/AvailableAttackIndicator";
import AvailableCastIndicator from "@/game/renderer/AvailableCastIndicator";
import AvailableMoveIndicator from "@/game/renderer/AvailableMoveIndicator";
import EntityView from "@/game/renderer/EntityView";
import GameView from "@/game/renderer/GameView";
import OverlayGrid from "@/game/renderer/OverlayGrid";
import SelectionIndicator from "@/game/renderer/SelectionIndicator";
import SummonIndicator from "@/game/renderer/SummonIndicator";
import Viewport from "@/game/renderer/Viewport";
import WorldTileView from "@/game/renderer/WorldTileView";
import { Hex } from "honeycomb-grid";
import { Application, FederatedPointerEvent, Rectangle } from "pixi.js";

let _renderer: GameRenderer | null = null;
export async function initGameRenderer(
  container: HTMLElement,
  handler: IGameEvents
) {
  if (_renderer != null) {
    console.warn("Not re-initializing GameRenderer, likely hot re loaded");
    return _renderer;
  }

  _renderer = new GameRenderer(handler);
  await _renderer.init(container);
  return _renderer;
}

export default class GameRenderer {
  private readonly app: Application;
  private viewport: Viewport;

  private entityViews: Record<string, EntityView> = {};
  private worldTileViews: Record<string, WorldTileView> = {};
  private otherViews: GameView[] = [];
  private tooltipTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly handler: IGameEvents) {
    this.app = new Application();
    this.viewport = new Viewport(new Rectangle(0, 0, 0, 0));
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
    this.viewport = new Viewport(this.app.screen);
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
      "pointermove",
      this.viewport.handlePointerMove.bind(this.viewport)
    );
    this.app.stage.on("pointermove", this.handlePointerMove.bind(this));
    this.app.stage.on("pointerdown", (event: FederatedPointerEvent) => {
      if (this.viewport.hoveredWorldHex != null) {
        this.handler.handleClickWorldHex(this.viewport.hoveredWorldHex);
        event.preventDefault();
      }
    });

    // Global window events.
    window.addEventListener(
      "pointerup",
      this.viewport.handlePointerUp.bind(this.viewport)
    );

    // Start renderer.
    await assetPromise;

    // Initialize the world tiles based on an empty world.
    this.worldTileViews = {};
    for (const hex of emptyWorld.grid) {
      this.worldTileViews[World.key(hex)] = new WorldTileView(
        this.viewport.mainContainer,
        hex
      );
    }

    // Initialize other view components.
    this.otherViews = [
      new OverlayGrid(this.viewport),
      new SelectionIndicator(this.viewport),
      new AvailableMoveIndicator(this.viewport),
      new AvailableCastIndicator(this.viewport),
      new AvailableAttackIndicator(this.viewport),
      new SummonIndicator(this.viewport),
    ];
  }

  public entityAttackAnimation(model: GameModel, from: number, to: number) {
    const fromView = this.entityViews[from];
    if (fromView == null) {
      return;
    }

    const toEntity = model.state.entities[to];
    if (toEntity == null) {
      return;
    }

    const hex = worldGrid.getHex([toEntity.tile.q, toEntity.tile.r]);
    if (hex == null) {
      return;
    }

    fromView.playAttackAnimation(hex);
  }

  public update(model: GameModel) {
    // Update world tiles.
    for (const tile of model.state.tiles) {
      this.worldTileViews[World.key(tile.position)].update(tile);
    }

    // Update entity rendering - retained-mode style.
    const staleViewIds = new Set(Object.keys(this.entityViews));
    for (const [id, entity] of Object.entries(model.state.entities)) {
      staleViewIds.delete(id);
      if (!this.entityViews[id]) {
        this.entityViews[id] = new EntityView();
        this.viewport.mainContainer.addChild(this.entityViews[id]);
      }
      this.entityViews[id].update(entity, entity.owner == model.areHost());
    }
    for (const staleId of staleViewIds) {
      this.viewport.mainContainer.removeChild(this.entityViews[staleId]);
      delete this.entityViews[staleId];
    }

    for (const view of this.otherViews) {
      view.update(model);
    }
  }

  public getScreenPositionForHex(hex: Hex) {
    return this.viewport.toGlobal({
      x: hex.x * this.viewport.renderScale(),
      y: hex.y * this.viewport.renderScale(),
    });
  }

  private handlePointerMove(event: FederatedPointerEvent) {
    // Tooltip timeout logic.
    if (this.tooltipTimer != null) {
      clearTimeout(this.tooltipTimer);
    }
    this.tooltipTimer = setTimeout(() => {
      if (this.viewport.hoveredWorldHex != null) {
        this.handler.handleShowHexTooltip(this.viewport.hoveredWorldHex);
      }
    }, gameConfig.tooltipTimeout);
    this.handler.handleHideTooltip();
  }

  private resize() {
    this.app.renderer.resize(
      window.innerWidth,
      window.innerHeight - gameConfig.gameViewVerticalPadding
    );
    this.viewport.centerOn(0, 0);
  }
}
