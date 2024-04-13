import { Container, Rectangle } from "pixi.js";

export default class Viewport extends Container {
  constructor(screen: Rectangle) {
    super();
    this.eventMode = "static";
    this.hitArea = screen;

    this.on("pointerdown", (event) => {
      console.dir(event);
    });
  }
}
