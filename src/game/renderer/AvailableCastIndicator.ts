import { GameModel } from "@/game/model/gameModel";
import GameView from "@/game/renderer/GameView";
import Viewport from "@/game/renderer/Viewport";
import { wrapAroundPolyPoints } from "@/game/renderer/graphicsUtil";
import { Container, Graphics } from "pixi.js";

export default class AvailableCastIndicator extends GameView {
  private c: Container;

  constructor(viewport: Viewport) {
    super(viewport);

    this.c = new Container();
    this.viewport.mainContainer.addChild(this.c);
  }

  public update(model: GameModel) {
    this.c.removeChildren();
    if (model.selectedSummon == null && model.selectedSpell == null) {
      return;
    }

    const g = new Graphics();
    this.c.addChild(g);
    const polyPoints = wrapAroundPolyPoints(
      model.availableActionLocations.map((h) => h.corners)
    );
    for (const points of polyPoints) {
      g.fill({
        color: 0x6600ff,
        alpha: 0.5,
      }).poly(points);
    }
  }
}
