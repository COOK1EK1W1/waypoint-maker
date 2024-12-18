import { expect, test } from "bun:test";
import { Segment, XY } from "@/types/dubins";
import { pathLength, segmentLength } from "@/util/dubins/geometry";

test("straight line len 3, 4, 5", () => {
  const a: Segment = {type: "Straight", start: {x: 0, y: 0}, end: {x: 3, y: 4}}
  expect(segmentLength(a)).toBe(5);
});

test("straight line len -3, -4, 5", () => {
  const a: Segment = {type: "Straight", end: {x: 0, y: 0}, start: {x: 3, y: 4}}
  expect(segmentLength(a)).toBe(5);
});

test("full circle", () => {
  const a: Segment = {type: "Curve", center: {x: 3, y: 4}, radius: 10, start: 0, theta: Math.PI * 2}
  expect(segmentLength(a)).toBeCloseTo(Math.PI * 20);
});

test("curve len 0", () => {
  const a: Segment = {type: "Curve", center: {x: 3, y: 4}, radius: 10, start: 0, theta: 0}
  expect(segmentLength(a)).toBeCloseTo(0);
});

test("half curve", () => {
  const a: Segment = {type: "Curve", center: {x: 3, y: 4}, radius: 10, start: 0, theta: Math.PI}
  expect(segmentLength(a)).toBeCloseTo(Math.PI * 10);
});

test("half backwards curve", () => {
  const a: Segment = {type: "Curve", center: {x: 3, y: 4}, radius: 10, start: 0, theta: -Math.PI}
  expect(segmentLength(a)).toBeCloseTo(Math.PI * 10);
});

test("offset half curve", () => {
  const a: Segment = {type: "Curve", center: {x: 3, y: 4}, radius: 10, start: Math.PI, theta: -Math.PI}
  expect(segmentLength(a)).toBeCloseTo(Math.PI * 10);
});


test("straight segments length", () => {
  const a: Segment = {type: "Straight", start: {x: 3, y: 4}, end: {x: 0, y: 0}}
  const b: Segment = {type: "Straight", start: {x: 0, y: 0}, end: {x: 3, y: 4}}
  expect(pathLength([a, b, a])).toBeCloseTo(15);
});
