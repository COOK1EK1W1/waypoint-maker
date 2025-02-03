import { expect, test } from "bun:test";
import { g2l, l2g } from "./conversion";

// Test case: Reference point matches input point
test("test same points", () => {
  const refLat = 52.0;
  const refLng = 0.0;

  const result = g2l({ lat: refLat, lng: refLng }, { lat: refLat, lng: refLng });
  expect(result).toEqual({ x: 0, y: 0 });
});

// Test case: Check for movement east
test('should calculate the ENU coordinates for a point east of the reference', () => {
  const refLat = 52.0;
  const refLng = 0.0;

  const lat = 52.0;
  const lng = 0.001; // Small offset east

  const result = g2l({ lat: refLat, lng: refLng }, { lat, lng });
  expect(result.x).toBeGreaterThan(0);
  expect(result.y).toBeCloseTo(0, 3);
});

// Test case: Check for movement north
test('should calculate the ENU coordinates for a point north of the reference', () => {
  const refLat = 52.0;
  const refLng = 0.0;

  const lat = 52.001; // Small offset north
  const lng = 0.0;

  const result = g2l({ lat: refLat, lng: refLng }, { lat, lng });
  expect(result.y).toBeGreaterThan(0);
  expect(result.x).toBeCloseTo(0, 2);
});

test("global to local same", () => {
  const refLat = 52.0
  const refLng = 0
  const result = l2g({ lat: refLat, lng: refLng }, { x: 0, y: 0 })

  expect(result.lat).toBeCloseTo(52, 3);
  expect(result.lng).toBeCloseTo(0, 3);
})

test("global to local same", () => {
  const refLat = 52.0
  const refLng = 0
  const result = g2l({ lat: refLat, lng: refLng }, l2g({ lat: refLat, lng: refLng }, { x: 200, y: 200 }))

  expect(result.x).toBeCloseTo(200, 3);
  expect(result.y).toBeCloseTo(200, 3);
})
