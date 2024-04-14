import world, { emptyWorld } from "@/game/model/World";
import gameConfig from "@/game/config/gameConfig";
import { Container, Graphics, Point } from "pixi.js";
import Viewport from "@/game/renderer/Viewport";
import { GameModel } from "@/game/model/gameModel";

export default class SelectionIndicator {
  private readonly g: Graphics;

  constructor(private readonly viewport: Viewport) {
    this.g = new Graphics().setStrokeStyle({
      width: 1,
      color: gameConfig.selectionColor,
      alpha: gameConfig.selectionAlpha,
    });
    this.viewport.rawContainer.addChild(this.g);

    // let first: Point[] = [];
    // for (const hex of emptyWorld.grid) {
    //   const points = hex.corners.map(
    //     (p) =>
    //       new Point(
    //         p.x * this.viewport.renderScale(),
    //         p.y * this.viewport.renderScale()
    //       )
    //   );
    //   if (first.length < 1) {
    //     first = points;
    //   }
    //   g.stroke().poly(points);
    // }
    // g.stroke().poly(first);
  }

  public update(model: GameModel) {
    if (model.selectedEntity == null) {
      this.g.visible = false;
    } else {
      this.g.visible = true;
    }
  }
}
