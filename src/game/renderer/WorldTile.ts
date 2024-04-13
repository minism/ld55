import { getTexture } from "@/game/assets";
import gameConfig from "@/game/config/gameConfig";
import { Hex } from "honeycomb-grid";
import { Container, Sprite } from "pixi.js";

export default class WorldTile {
  private readonly spr: Sprite;

  constructor(container: Container, private readonly hex: Hex) {
    this.spr = new Sprite(getTexture("hexGrass"));
    this.spr.x = this.hex.x - gameConfig.tileSize / 2;
    this.spr.y = this.hex.y - gameConfig.tileSize / 2;
    container.addChild(this.spr);
  }
}
