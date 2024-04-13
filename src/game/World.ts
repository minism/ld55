import {
  Grid,
  Hex,
  HexCoordinates,
  Orientation,
  defineHex,
  rectangle,
  spiral,
} from "honeycomb-grid";

const GameHex = defineHex({
  dimensions: { width: 16, height: 16 },
  orientation: Orientation.POINTY,
  origin: { x: 0, y: 0 },
  offset: -1,
});

// Hex grid world representation.
class World {
  public readonly grid: Grid<Hex>;

  constructor() {
    // Create a hex-shaped map.
    const radius = 5;
    this.grid = new Grid(
      GameHex,
      spiral({
        start: [0, 0],
        radius,
      })
    );
  }
}

// Singleton access
const world = new World();
export default world;
