import { expect, test } from "bun:test";
import { Path, Segment, XY } from "@/types/dubins";
import { pathLength, segmentLength } from "@/lib/dubins/geometry";

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

test("point in poly", () => {

})
