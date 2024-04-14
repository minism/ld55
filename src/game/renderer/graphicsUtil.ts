import { Point } from "honeycomb-grid";
import { Graphics } from "pixi.js";

export function wrapAroundPolyPoints(polyPoints: Point[][]) {
  return [...polyPoints, polyPoints[0]];
}
