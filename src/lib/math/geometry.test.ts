import { expect, test } from "bun:test";
import { isPointInPolygon } from "./geometry";
import { XY } from "./types";

// Helper function to create XY points
const p = (x: number, y: number): XY => ({ x, y });

test("point inside square", () => {
  // Create a square polygon
  const square = [
    p(0, 0),
    p(0, 2),
    p(2, 2),
    p(2, 0)
  ];

  // Test point inside the square
  expect(isPointInPolygon(square, p(1, 1))).toBe(true);
});

test("point outside square", () => {
  const square = [
    p(0, 0),
    p(0, 2),
    p(2, 2),
    p(2, 0)
  ];

  // Test point outside the square
  expect(isPointInPolygon(square, p(3, 3))).toBe(false);
});

test("point on polygon vertex", () => {
  const square = [
    p(0, 0),
    p(0, 2),
    p(2, 2),
    p(2, 0)
  ];

  // Test point exactly on a vertex
  expect(isPointInPolygon(square, p(0, 0))).toBe(false);
});

test("point on polygon edge", () => {
  const square = [
    p(0, 0),
    p(0, 2),
    p(2, 2),
    p(2, 0)
  ];

  // Test point exactly on an edge
  expect(isPointInPolygon(square, p(1, 0))).toBe(false);
});

test("point inside complex polygon", () => {
  // Create a more complex polygon (star shape)
  const star = [
    p(2, 0),
    p(2.5, 1.5),
    p(4, 1.5),
    p(3, 2.5),
    p(3.5, 4),
    p(2, 3),
    p(0.5, 4),
    p(1, 2.5),
    p(0, 1.5),
    p(1.5, 1.5)
  ];

  // Test point inside the star
  expect(isPointInPolygon(star, p(2, 2))).toBe(true);
});

test("point outside complex polygon", () => {
  const star = [
    p(2, 0),
    p(2.5, 1.5),
    p(4, 1.5),
    p(3, 2.5),
    p(3.5, 4),
    p(2, 3),
    p(0.5, 4),
    p(1, 2.5),
    p(0, 1.5),
    p(1.5, 1.5)
  ];

  // Test point outside the star
  expect(isPointInPolygon(star, p(4, 4))).toBe(false);
});

test("point inside concave polygon", () => {
  // Create a concave polygon (C shape)
  const concave = [
    p(0, 0),
    p(0, 3),
    p(3, 3),
    p(3, 2),
    p(1, 2),
    p(1, 1),
    p(3, 1),
    p(3, 0)
  ];

  // Test point inside the concave part
  expect(isPointInPolygon(concave, p(2, 0.5))).toBe(true);
});

test("point outside concave polygon", () => {
  const concave = [
    p(0, 0),
    p(0, 3),
    p(3, 3),
    p(3, 2),
    p(1, 2),
    p(1, 1),
    p(3, 1),
    p(3, 0)
  ];

  // Test point in the "hole" of the C shape
  expect(isPointInPolygon(concave, p(2, 1.5))).toBe(false);
}); 
