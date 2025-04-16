import { expect, test } from "bun:test";
import { worldOffset, haversineDistance } from "@/lib/world/distance";

test("worldOffset - basic north offset", () => {
  const start = { lat: 0, lng: 0 };
  const result = worldOffset(start, 1000, 0); // 1km north
  expect(result.lat).toBeGreaterThan(start.lat);
  expect(result.lng).toBeCloseTo(start.lng, 6);
  expect(haversineDistance(start, result)).toBeCloseTo(1000, 1);
});

test("worldOffset - basic east offset", () => {
  const start = { lat: 0, lng: 0 };
  const result = worldOffset(start, 1000, Math.PI / 2); // 1km east
  expect(result.lat).toBeCloseTo(start.lat, 6);
  expect(result.lng).toBeGreaterThan(start.lng);
  expect(haversineDistance(start, result)).toBeCloseTo(1000, 1);
});

test("worldOffset - basic south offset", () => {
  const start = { lat: 0, lng: 0 };
  const result = worldOffset(start, 1000, Math.PI); // 1km south
  expect(result.lat).toBeLessThan(start.lat);
  expect(result.lng).toBeCloseTo(start.lng, 6);
  expect(haversineDistance(start, result)).toBeCloseTo(1000, 1);
});

test("worldOffset - basic west offset", () => {
  const start = { lat: 0, lng: 0 };
  const result = worldOffset(start, 1000, 3 * Math.PI / 2); // 1km west
  expect(result.lat).toBeCloseTo(start.lat, 6);
  expect(result.lng).toBeLessThan(start.lng);
  expect(haversineDistance(start, result)).toBeCloseTo(1000, 1);
});

test("worldOffset - zero distance", () => {
  const start = { lat: 40, lng: -74 };
  const result = worldOffset(start, 0, Math.PI / 4);
  expect(result).toEqual(start);
});

test("worldOffset - at north pole", () => {
  const start = { lat: 90, lng: 0 };
  const result = worldOffset(start, 1000, Math.PI / 4);
  expect(result.lat).toBeLessThan(90);
  expect(result.lng).toBeDefined();
});

test("worldOffset - at south pole", () => {
  const start = { lat: -90, lng: 0 };
  const result = worldOffset(start, 1000, Math.PI / 4);
  expect(result.lat).toBeGreaterThan(-90);
  expect(result.lng).toBeDefined();
});

test("worldOffset - crossing international date line", () => {
  const start = { lat: 0, lng: 179.9 };
  const result = worldOffset(start, 20000, Math.PI / 2); // 20km east
  expect(result.lng).toBeLessThan(0);
});

test("worldOffset - large distance", () => {
  const start = { lat: 0, lng: 0 };
  const result = worldOffset(start, 1000000, Math.PI / 4); // 1000km northeast
  expect(haversineDistance(start, result)).toBeCloseTo(1000000);
});

test("worldOffset - at equator with different angles", () => {
  const start = { lat: 0, lng: 0 };
  const angles = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI, 5 * Math.PI / 4, 3 * Math.PI / 2, 7 * Math.PI / 4];

  for (const angle of angles) {
    const result = worldOffset(start, 1000, angle);
    expect(haversineDistance(start, result)).toBeCloseTo(1000, 1);
  }
});

test("worldOffset - at high latitude", () => {
  const start = { lat: 60, lng: 0 };
  const result = worldOffset(start, 1000, Math.PI / 2); // 1km east
  expect(result.lat).toBeCloseTo(start.lat);
  expect(result.lng).toBeGreaterThan(start.lng);
  expect(haversineDistance(start, result)).toBeCloseTo(1000, 1);
});

test("worldOffset - crossing north pole", () => {
  const start = { lat: 89.9, lng: 0 };
  const result = worldOffset(start, 20000, 0); // 20km north from near pole
  expect(result.lat).toBeLessThan(90);
  expect(result.lng).toBeCloseTo(180, 1); // Should wrap to opposite side
});

test("worldOffset - crossing south pole", () => {
  const start = { lat: -89.9, lng: 0 };
  const result = worldOffset(start, 20000, Math.PI); // 20km south from near pole
  expect(result.lat).toBeGreaterThan(-90);
  expect(result.lng).toBeCloseTo(180, 1); // Should wrap to opposite side
});

test("worldOffset - crossing both poles", () => {
  const start = { lat: 89.9, lng: 0 };
  const result = worldOffset(start, 40000, Math.PI); // 40km south from near north pole
  expect(result.lat).toBeGreaterThan(-89.9); // Should be near south pole
  expect(result.lng).toBeCloseTo(0, 1); // Should be on opposite side
}); 
