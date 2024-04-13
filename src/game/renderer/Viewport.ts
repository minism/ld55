import world from "@/game/World";
import gameConfig from "@/game/config/gameConfig";
import { TooltipModel } from "@/game/model/tooltipModel";
import { Hex } from "honeycomb-grid";
import {
  Application,
  Container,
  FederatedPointerEvent,
  Point,
  Rectangle,
} from "pixi.js";

export default class Viewport extends Container {
  public mainContainer: Container;
  public rawContainer: Container; // Unscaled

  private dragStart: Point | null = null;
  private positionStart: Point;

  private lastHoveredHex: Hex | null = null;

  constructor(private screen: Rectangle, private tooltip: TooltipModel) {
    super();

    this.positionStart = this.position;

    this.rawContainer = new Container({});
    this.mainContainer = new Container({
      scale: gameConfig.defaultRenderScale,
    });
    this.addChild(this.mainContainer);
    this.addChild(this.rawContainer);
  }

  public handlePointerDown(event: FederatedPointerEvent) {
    this.positionStart = this.position.clone();
    this.dragStart = new Point(event.global.x, event.global.y);
  }

  public handlePointerUp(event: FederatedPointerEvent) {
    this.dragStart = null;
  }

  public handlePointerMove(event: FederatedPointerEvent) {
    // Update tooltip.
    const worldPoint = this.mainContainer.toLocal(event.global);
    const hex = world.grid.pointToHex(worldPoint);

    // Check if hex exists.
    if (world.grid.hasHex(hex)) {
      this.lastHoveredHex = hex;
      this.tooltip.visible = true;
      this.tooltip.positionX = event.global.x;
      this.tooltip.positionY = event.global.y;
      this.tooltip.text = `Tile (${hex.q},${hex.r})`;
    } else {
      this.tooltip.visible = false;
    }

    // Update dragging.
    if (this.dragStart == null) {
      return;
    }

    const dx = event.global.x - this.dragStart.x;
    const dy = event.global.y - this.dragStart.y;
    this.position.x = this.positionStart.x + dx;
    this.position.y = this.positionStart.y + dy;
  }

  // Focus the viewport such that the given point is in the center.
  public centerOn(x: number, y: number) {
    this.position.x = x + this.screen.width / 2;
    this.position.y = y + this.screen.height / 2;
  }
}
