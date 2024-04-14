import { getTexture } from "@/game/assets";
import { entityDefsById } from "@/game/data/entityDefs";
import { Entity } from "@/game/db/gameState";
import { worldGrid } from "@/game/model/World";
import { Hex } from "honeycomb-grid";
import { Sprite } from "pixi.js";
import gsap from "gsap";
import gameConfig from "@/game/config/gameConfig";

export default class EntityView extends Sprite {
  private lastHex: Hex | null;

  constructor() {
    super();
    this.lastHex = null;
  }

  public update(entity: Entity) {
    const def = entityDefsById[entity.def];
    this.texture = getTexture(def.sprite);
    this.anchor.set(0.5);
    const hex = worldGrid.getHex([entity.tile.q, entity.tile.r]);

    if (hex != null) {
      if (hex != this.lastHex) {
        gsap.to(this, {
          x: hex.x,
          y: hex.y,
          duration: gameConfig.entityTweenTime,
        });
      } else {
        this.x = hex.x;
        this.y = hex.y;
      }
    } else {
      throw new Error(
        `Invalid tile for entity: (${entity.tile.q}, ${entity.tile.r}`
      );
    }
  }
}
