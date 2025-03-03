import { XY } from "../math/types";

export function crossProduct(p1: XY, p2: XY, p3: XY) {
  return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x)
}
