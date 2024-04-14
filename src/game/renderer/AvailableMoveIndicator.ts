import gameConfig from "@/game/config/gameConfig";
import { emptyWorld } from "@/game/model/World";
import { GameModel } from "@/game/model/gameModel";
import Viewport from "@/game/renderer/Viewport";
import { Graphics, Point } from "pixi.js";

export default class SelectionIndicator {
  private readonly g: Graphics;

  constructor(private readonly viewport: Viewport) {
    const g = new Graphics().setStrokeStyle({
      width: 1,
      color: gameConfig.selectionColor,
      alpha: gameConfig.selectionAlpha,
    });
    this.viewport.rawContainer.addChild(g);

    const hex = emptyWorld.grid.getHex([0, 0])!;
    const points = hex.corners.map(
      (p) =>
        new Point(
          p.x * this.viewport.renderScale(),
          p.y * this.viewport.renderScale()
        )
    );
    g.stroke().poly(points);
    g.stroke().poly(points);

    this.g = g;
  }

  public update(model: GameModel) {
    if (model.selectedEntity == null) {
      this.g.visible = false;
    } else {
      this.g.visible = true;
      const hex = emptyWorld.grid.getHex(model.selectedEntity.tile);
      if (hex != null) {
        this.g.x = hex.x * this.viewport.renderScale();
        this.g.y = hex.y * this.viewport.renderScale();
      }
    }
  }
}
