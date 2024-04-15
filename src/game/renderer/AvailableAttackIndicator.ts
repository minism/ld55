import { GameModel } from "@/game/model/gameModel";
import GameView from "@/game/renderer/GameView";
import Viewport from "@/game/renderer/Viewport";
import { wrapAroundPolyPoints } from "@/game/renderer/graphicsUtil";
import { Container, Graphics } from "pixi.js";

export default class AvailableAttackIndicator extends GameView {
  private c: Container;

  constructor(viewport: Viewport) {
    super(viewport);

    this.c = new Container();
    this.viewport.mainContainer.addChild(this.c);
  }

  public update(model: GameModel) {
    this.c.removeChildren();
    if (
      (model.selectedEntity == null && model.selectedSpell == null) ||
      model.availableAttackLocations.length < 1
    ) {
      return;
    }

    const g = new Graphics();
    g.interactive = true;
    g.cursor = "pointer";
    this.c.addChild(g);
    const polyPoints = wrapAroundPolyPoints(
      model.availableAttackLocations.map((h) => h.corners)
    );
    for (const points of polyPoints) {
      g.fill({
        color: 0xff0000,
        alpha: 0.5,
      }).poly(points);
    }
  }
}
