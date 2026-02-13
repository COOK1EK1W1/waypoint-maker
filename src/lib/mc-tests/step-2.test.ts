import { expect, test } from "bun:test";
import { Path } from "../dubins/types";
import { XY } from "../math/types";
import { pathLength } from "@/components/waypointEditor/optimisaion/optimisation";

test("path length", () => {
  let curves: Path<XY> = []
  expect(pathLength(curves)).toBe(0)

  curves.push({ type: "Straight", start: { x: 0, y: 0 }, end: { x: 0, y: 10 } })
  expect(pathLength(curves)).toBe(10)

  curves.push({ type: "Straight", start: { x: 0, y: 0 }, end: { x: 10, y: 10 } })
  expect(pathLength(curves)).toBeCloseTo(10 + 14.1421)

  curves.push({ type: "Curve", center: { x: 0, y: 0 }, start: 0, theta: Math.PI, radius: 10 })
  expect(pathLength(curves)).toBeCloseTo(10 + 14.1421 + 31.4159)
})

