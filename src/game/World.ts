import { Grid, Hex, Orientation, defineHex, rectangle } from "honeycomb-grid";

const GameHex = defineHex({
  dimensions: 30,
  orientation: Orientation.POINTY,
  origin: { x: 0, y: 0 },
  offset: -1,
});

// Hex grid world representation.
class World {
  public readonly grid: Grid<Hex>;

  constructor() {
    this.grid = new Grid(GameHex, rectangle({ width: 10, height: 10 }));
    this.grid.forEach(console.log);
  }
}

// Singleton access
const world = new World();
export default world;
