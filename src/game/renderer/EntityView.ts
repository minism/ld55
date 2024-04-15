import { getTexture } from "@/game/assets";
import { entityDefsById } from "@/game/data/entityDefs";
import { Entity } from "@/game/db/gameState";
import { worldGrid } from "@/game/model/World";
import { Hex } from "honeycomb-grid";
import { Container, Graphics, Sprite } from "pixi.js";
import gsap from "gsap";
import gameConfig from "@/game/config/gameConfig";

export default class EntityView extends Container {
  private lastHex: Hex | null;
  private spr: Sprite;
  private indicator: Sprite;

  private animPromise: Promise<unknown> | null = null;

  constructor() {
    super();
    this.lastHex = null;
    this.spr = new Sprite();
    this.indicator = new Sprite();

    this.addChild(this.spr);
    this.addChild(this.indicator);
  }

  public update(entity: Entity, ours: boolean) {
    const def = entityDefsById[entity.def];
    this.spr.texture = getTexture(def.sprite);
    this.spr.anchor.set(0.4, 0.5);
    this.indicator.texture = getTexture(
      ours ? "ourPlayerIndicator" : "opponentPlayerIndicator"
    );
    this.indicator.anchor.set(0.5);
    const hex = worldGrid.getHex([entity.tile.q, entity.tile.r]);

    if (hex != null) {
      if (hex != this.lastHex && this.lastHex != null) {
        this.queueAnimation(hex);
      } else {
        this.x = hex.x;
        this.y = hex.y;
      }
      this.lastHex = hex;
    } else {
      throw new Error(
        `Invalid tile for entity: (${entity.tile.q}, ${entity.tile.r}`
      );
    }
  }

  public async playAttackAnimation(hex: Hex) {
    const orig = { x: this.x, y: this.y };
    await this.queueAnimation(hex);
    await this.queueAnimation(orig);
  }

  private async queueAnimation({ x, y }: { x: number; y: number }) {
    if (this.animPromise != null) {
      await this.animPromise;
    }
    this.animPromise = gsap
      .to(this, {
        x,
        y,
        duration: gameConfig.entityTweenTime,
      })
      .then();
    await this.animPromise;
  }
}
