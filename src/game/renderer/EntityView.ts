import { getTexture } from "@/game/assets";
import { entityDefsById } from "@/game/data/entityDefs";
import { Entity } from "@/game/db/gameState";
import { worldGrid } from "@/game/model/World";
import { Sprite } from "pixi.js";

export default class EntityView extends Sprite {
  public update(entity: Entity) {
    const def = entityDefsById[entity.def];
    this.texture = getTexture(def.sprite);
    this.anchor.set(0.5);
    const hex = worldGrid.getHex([entity.tile.q, entity.tile.r]);
    if (hex != null) {
      this.position.x = hex.x;
      this.position.y = hex.y;
    } else {
      throw new Error(
        `Invalid tile for entity: (${entity.tile.q}, ${entity.tile.r}`
      );
    }
  }
}
