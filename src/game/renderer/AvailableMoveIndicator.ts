import { GameModel } from "@/game/model/gameModel";
import GameView from "@/game/renderer/GameView";
import Viewport from "@/game/renderer/Viewport";
import { wrapAroundPolyPoints } from "@/game/renderer/graphicsUtil";
import { Container, Graphics } from "pixi.js";

export default class AvailableMoveIndicator extends GameView {
  private c: Container;

  constructor(viewport: Viewport) {
    super(viewport);

    this.c = new Container();
    this.viewport.mainContainer.addChild(this.c);
  }

  public update(model: GameModel) {
    this.c.removeChildren();
    if (model.selectedEntity == null) {
      return;
    }

    const g = new Graphics();
    this.c.addChild(g);
    const polyPoints = wrapAroundPolyPoints(
      model.availableMoves.map((h) => h.corners)
    );
    for (const points of polyPoints) {
      g.fill({
        color: 0x00ff33,
        alpha: 0.25,
      }).poly(points);
    }
  }
}
