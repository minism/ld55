import { getTexture } from "@/game/assets";
import { worldGrid } from "@/game/model/World";
import { GameModel } from "@/game/model/gameModel";
import GameView from "@/game/renderer/GameView";
import Viewport from "@/game/renderer/Viewport";
import { Container, Sprite } from "pixi.js";

export default class SummonIndicator extends GameView {
  private c: Container;

  constructor(viewport: Viewport) {
    super(viewport);

    this.c = new Container();
    this.viewport.mainContainer.addChild(this.c);
  }

  public update(model: GameModel) {
    this.c.removeChildren();
    const tex = getTexture("summon");
    for (const summon of model.state.summons) {
      const spr = new Sprite(tex);
      spr.anchor.set(0.5);
      const hex = worldGrid.getHex([summon.tile.q, summon.tile.r]);
      if (hex != null) {
        spr.x = hex.x;
        spr.y = hex.y;
        this.c.addChild(spr);
      }
    }
  }
}
