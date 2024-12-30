import { expect, test } from "bun:test";
import { Segment, XY } from "@/types/dubins";
import { bearing, modf, offset, pathLength, segmentLength, worldBearing } from "@/lib/dubins/geometry";

test("straight line len", () => {
  const a: Segment = {type: "Straight", start: {x: 0, y: 0}, end: {x: 3, y: 4}}
  expect(segmentLength(a)).toBe(5);

  const b: Segment = {type: "Straight", end: {x: 0, y: 0}, start: {x: 3, y: 4}}
  expect(segmentLength(b)).toBe(5);

  const c: Segment = {type: "Straight", end: {x: 0, y: 0}, start: {x: 3, y: 4}}
  expect(segmentLength(c)).toBe(5);

  const d: Segment = {type: "Straight", end: {x: 0, y: 0}, start: {x: 0, y: 0}}
  expect(segmentLength(d)).toBe(0);
});


test("curve length", () => {
  const a: Segment = {type: "Curve", center: {x: 3, y: 4}, radius: 10, start: Math.PI, theta: -Math.PI}
  expect(segmentLength(a)).toBeCloseTo(Math.PI * 10);

  const b: Segment = {type: "Curve", center: {x: 3, y: 4}, radius: 10, start: 0, theta: -Math.PI}
  expect(segmentLength(b)).toBeCloseTo(Math.PI * 10);

  const c: Segment = {type: "Curve", center: {x: 3, y: 4}, radius: 10, start: 0, theta: Math.PI}
  expect(segmentLength(c)).toBeCloseTo(Math.PI * 10);

  const d: Segment = {type: "Curve", center: {x: 3, y: 4}, radius: 10, start: 0, theta: Math.PI * 2}
  expect(segmentLength(d)).toBeCloseTo(Math.PI * 20);

  const e: Segment = {type: "Curve", center: {x: 3, y: 4}, radius: 10, start: 0, theta: 0}
  expect(segmentLength(e)).toBeCloseTo(0);

});


test("offsets", () => {
  const a = offset({x: 0, y: 0}, 1, 0)
  const b = offset({x: 0, y: 0}, 1, Math.PI/2)
  const c = offset({x: 0, y: 0}, 1, Math.PI)
  const d = offset({x: 0, y: 0}, 1, Math.PI/2 * 3)

  expect(a.x).toBeCloseTo(0);
  expect(a.y).toBeCloseTo(1);

  expect(b.x).toBeCloseTo(1);
  expect(b.y).toBeCloseTo(0);

  expect(c.x).toBeCloseTo(0);
  expect(c.y).toBeCloseTo(-1);

  expect(d.x).toBeCloseTo(-1);
  expect(d.y).toBeCloseTo(0);
});

test("bearings", ()=>{

  expect(bearing({x: 0, y:0}, {x: 0, y: 1})).toBeCloseTo(0)
  expect(bearing({x: 0, y:0}, {x: 1, y: 0})).toBeCloseTo(Math.PI / 2)
  expect(bearing({x: 0, y:0}, {x: 0, y: -1})).toBeCloseTo(Math.PI)
  expect(bearing({x: 0, y:0}, {x: -1, y: 0})).toBeCloseTo(Math.PI / 2 * 3)

})

test("modf", ()=>{
  expect(modf(5, 5)).toBe(0)
  expect(modf(10, 5)).toBe(0)
  expect(modf(12, 5)).toBe(2)
  expect(modf(12, 5)).toBe(2)
  expect(modf(-5, 5)).toBe(0)
  expect(modf(-12, 5)).toBe(3)
})

test("world Bearing", ()=>{
  expect(worldBearing({x: 0, y: 0}, {x: 0, y: 10})).toBe(0)
  expect(worldBearing({x: 0, y: 0}, {x: 0, y: -10})).toBeCloseTo(Math.PI)
})
