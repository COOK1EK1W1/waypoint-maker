import { expect, test } from "bun:test";
import { loadFactor, pathEnergyRequirements, pathLength, segmentLength } from "@/lib/dubins/geometry";
import { XY } from "@/lib/math/types";
import { Path, Segment } from "../types";

test("straight line len", () => {
  const a: Segment<XY> = { type: "Straight", start: { x: 0, y: 0 }, end: { x: 3, y: 4 } }
  expect(segmentLength(a)).toBe(5);

  const b: Segment<XY> = { type: "Straight", end: { x: 0, y: 0 }, start: { x: 3, y: 4 } }
  expect(segmentLength(b)).toBe(5);

  const c: Segment<XY> = { type: "Straight", end: { x: 0, y: 0 }, start: { x: 3, y: 4 } }
  expect(segmentLength(c)).toBe(5);

  const d: Segment<XY> = { type: "Straight", end: { x: 0, y: 0 }, start: { x: 0, y: 0 } }
  expect(segmentLength(d)).toBe(0);
});


test("curve length", () => {
  const a: Segment<XY> = { type: "Curve", center: { x: 3, y: 4 }, radius: 10, start: Math.PI, theta: -Math.PI }
  expect(segmentLength(a)).toBeCloseTo(Math.PI * 10);

  const b: Segment<XY> = { type: "Curve", center: { x: 3, y: 4 }, radius: 10, start: 0, theta: -Math.PI }
  expect(segmentLength(b)).toBeCloseTo(Math.PI * 10);

  const c: Segment<XY> = { type: "Curve", center: { x: 3, y: 4 }, radius: 10, start: 0, theta: Math.PI }
  expect(segmentLength(c)).toBeCloseTo(Math.PI * 10);

  const d: Segment<XY> = { type: "Curve", center: { x: 3, y: 4 }, radius: 10, start: 0, theta: Math.PI * 2 }
  expect(segmentLength(d)).toBeCloseTo(Math.PI * 20);

  const e: Segment<XY> = { type: "Curve", center: { x: 3, y: 4 }, radius: 10, start: 0, theta: 0 }
  expect(segmentLength(e)).toBeCloseTo(0);

});



test("path length", () => {
  let curves: Path<XY> = []
  expect(pathLength(curves)).toBe(0)

  curves.push({ type: "Straight", start: { x: 0, y: 0 }, end: { x: 0, y: 10 } })
  expect(pathLength(curves)).toBe(10)
  curves.push({ type: "Curve", center: { x: 0, y: 0 }, start: 0, theta: Math.PI, radius: 10 })
  expect(pathLength(curves)).toBeCloseTo(10 + 31.4159)
})


test("Load factor", () => {
  expect(loadFactor(10, 0)).toBeCloseTo(1)

  expect(loadFactor(Infinity, 10)).toBeCloseTo(1)

  expect(loadFactor(34, 24)).toBeCloseTo(2)
  expect(loadFactor(105, 54)).toBeCloseTo(3)

  //expect(loadFactor(0, 10)).toBeCloseTo(Infinity) // swap these files eventually TODO
  expect(loadFactor(0, 10)).toBeCloseTo(0)
})

test("Energy Requirements for path", () => {
  const path: Path<XY> = [{ type: "Straight", start: { x: 0, y: 0 }, end: { x: 3, y: 4 } }]
  expect(pathEnergyRequirements(path, 24)).toBe(5)
  path.push({ type: "Curve", center: { x: 0, y: 0 }, start: 0, theta: Math.PI, radius: 27 })
  expect(pathEnergyRequirements(path, 24)).toBeCloseTo(208, 1)
})

test("Energy Requirements for path with constant", () => {
})
