import { getTexture } from "@/game/assets";
import gameConfig from "@/game/config/gameConfig";
import { TileType, WorldTile } from "@/game/model/WorldTile";
import { Hex } from "honeycomb-grid";
import { Container, Sprite } from "pixi.js";

export default class WorldTileView {
  private readonly spr: Sprite;

  constructor(container: Container, private readonly hex: Hex) {
    this.spr = new Sprite(getTexture("hexGrass"));
    this.spr.x = this.hex.x - gameConfig.tileSize / 2;
    this.spr.y = this.hex.y - gameConfig.tileSize / 2;
    container.addChild(this.spr);
  }

  public update(tile: WorldTile) {
    switch (tile.type) {
      case TileType.GRASS:
        this.spr.texture = getTexture("hexGrass");
        break;
      case TileType.FOREST:
        this.spr.texture = getTexture("hexForest");
        break;
      case TileType.WATER:
        this.spr.texture = getTexture("hexWater");
        break;
    }
  }
}
