import world, { emptyWorld } from "@/game/model/World";
import gameConfig from "@/game/config/gameConfig";
import { Container, Graphics, Point } from "pixi.js";
import GameView from "@/game/renderer/GameView";
import Viewport from "@/game/renderer/Viewport";

export default class OverlayGrid extends GameView {
  constructor(viewport: Viewport) {
    super(viewport);

    const g = new Graphics().setStrokeStyle({
      width: 1,
      color: gameConfig.overlayGridColor,
      alpha: gameConfig.overlayGridAlpha,
    });
    viewport.rawContainer.addChild(g);

    let first: Point[] = [];
    for (const hex of emptyWorld.grid) {
      const points = hex.corners.map(
        (p) =>
          new Point(
            p.x * this.viewport.renderScale(),
            p.y * this.viewport.renderScale()
          )
      );
      if (first.length < 1) {
        first = points;
      }
      g.stroke().poly(points);
    }
    g.stroke().poly(first);
  }

  public update() {}
}
