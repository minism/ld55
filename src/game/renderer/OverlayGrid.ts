import world, { emptyWorld } from "@/game/model/World";
import gameConfig from "@/game/config/gameConfig";
import { Container, Graphics, Point } from "pixi.js";

export default class OverlayGrid {
  constructor(container: Container) {
    const g = new Graphics().setStrokeStyle({
      width: 1,
      color: gameConfig.overlayGridColor,
      alpha: gameConfig.overlayGridAlpha,
    });
    container.addChild(g);

    let first: Point[] = [];
    for (const hex of emptyWorld.grid) {
      const points = hex.corners.map(
        (p) =>
          new Point(
            p.x * gameConfig.defaultRenderScale,
            p.y * gameConfig.defaultRenderScale
          )
      );
      if (first.length < 1) {
        first = points;
      }
      g.stroke().poly(points);
    }
    g.stroke().poly(first);
  }
}
