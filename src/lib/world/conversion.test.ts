import { expect, test } from "bun:test";
import { g2l, l2g } from "./conversion";

// Test case: Reference point matches input point
test("test same points", () => {
  const refLat = 52.0;
  const refLng = 0.0;
  const refHeight = 100.0;

  const result = g2l([refLat, refLng, refHeight], [refLat, refLng, refHeight]);
  expect(result).toEqual([0, 0, 0]);
});

// Test case: Check for movement east
test('should calculate the ENU coordinates for a point east of the reference', () => {
  const refLat = 52.0;
  const refLng = 0.0;
  const refHeight = 100.0;

  const lat = 52.0;
  const lng = 0.001; // Small offset east
  const height = 100.0;

  const result = g2l([refLat, refLng, refHeight], [lat, lng, height]);
  expect(result[0]).toBeGreaterThan(0);
  expect(result[1]).toBeCloseTo(0, 3);
  expect(result[2]).toBeCloseTo(0, 3);
});

// Test case: Check for movement north
test('should calculate the ENU coordinates for a point north of the reference', () => {
  const refLat = 52.0;
  const refLng = 0.0;
  const refHeight = 100.0;

  const lat = 52.001; // Small offset north
  const lng = 0.0;
  const height = 100.0;

  const result = g2l([refLat, refLng, refHeight], [lat, lng, height]);
  expect(result[1]).toBeGreaterThan(0);
  expect(result[0]).toBeCloseTo(0, 2);
  expect(result[2]).toBeCloseTo(0, 2);
});

// Test case: Check for height difference
test('should calculate the ENU coordinates for a point with height difference', () => {
  const refLat = 52.0;
  const refLng = 0.0;
  const refHeight = 100.0;

  const lat = 52.0;
  const lng = 0.0;
  const height = 200.0; // Height difference

  const result = g2l([refLat, refLng, refHeight], [lat, lng, height]);
  expect(result[0]).toBeCloseTo(0, 3);
  expect(result[1]).toBeCloseTo(0, 3);
  expect(result[2]).toBeCloseTo(100, 3);
});

test("global to local same", () => {
  const refLat = 52.0
  const refLng = 0
  const refHeight = 100.0
  const result = l2g([refLat, refLng, refHeight], [0, 0, 0])

  expect(result[0]).toBeCloseTo(52, 3);
  expect(result[1]).toBeCloseTo(0, 3);
  expect(result[2]).toBeCloseTo(100, 3);
})

test("global to local same", () => {
  const refLat = 52.0
  const refLng = 0
  const refHeight = 100.0
  const result = g2l([refLat, refLng, refHeight], l2g([refLat, refLng, refHeight], [200, 200, 0]))

  expect(result[0]).toBeCloseTo(200, 3);
  expect(result[1]).toBeCloseTo(200, 3);
  expect(result[2]).toBeCloseTo(0, 3);
})
