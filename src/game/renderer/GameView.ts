import { GameModel } from "@/game/model/gameModel";
import Viewport from "@/game/renderer/Viewport";

export default abstract class GameView {
  constructor(protected readonly viewport: Viewport) {}

  public abstract update(model: GameModel): void;
}
