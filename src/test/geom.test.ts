import { expect, test } from "bun:test";
import { Segment, XY } from "@/types/dubins";
import { bearing, deg2rad, dist, mod2pi, modf, offset, rad2deg, segmentLength, worldBearing, worldDist } from "@/lib/dubins/geometry";

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


test("offsets", () => {
  const a = offset({ x: 0, y: 0 }, 1, 0)
  const b = offset({ x: 0, y: 0 }, 1, Math.PI / 2)
  const c = offset({ x: 0, y: 0 }, 1, Math.PI)
  const d = offset({ x: 0, y: 0 }, 1, Math.PI / 2 * 3)

  expect(a.x).toBeCloseTo(0);
  expect(a.y).toBeCloseTo(1);

  expect(b.x).toBeCloseTo(1);
  expect(b.y).toBeCloseTo(0);

  expect(c.x).toBeCloseTo(0);
  expect(c.y).toBeCloseTo(-1);

  expect(d.x).toBeCloseTo(-1);
  expect(d.y).toBeCloseTo(0);
});

test("bearings", () => {

  expect(bearing({ x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(0)
  expect(bearing({ x: 0, y: 0 }, { x: 1, y: 0 })).toBeCloseTo(Math.PI / 2)
  expect(bearing({ x: 0, y: 0 }, { x: 0, y: -1 })).toBeCloseTo(Math.PI)
  expect(bearing({ x: 0, y: 0 }, { x: -1, y: 0 })).toBeCloseTo(Math.PI / 2 * 3)

})

test("modf", () => {
  expect(modf(5, 5)).toBe(0)
  expect(modf(10, 5)).toBe(0)
  expect(modf(12, 5)).toBe(2)
  expect(modf(12, 5)).toBe(2)
  expect(modf(-5, 5)).toBe(0)
  expect(modf(-12, 5)).toBe(3)
})

test("mod2pi", () => {
  expect(mod2pi(0)).toBeCloseTo(0)
  expect(mod2pi(3.14)).toBeCloseTo(3.14)
  expect(mod2pi(Math.PI * 2)).toBeCloseTo(0)
  expect(mod2pi(-1)).toBeCloseTo(Math.PI * 2 - 1)
  expect(mod2pi(Math.PI * 12)).toBeCloseTo(0)
  expect(mod2pi(-2 * Math.PI)).toBeCloseTo(0)
})

test("world Bearing", () => {
  expect(worldBearing({ lng: 0, lat: 0 }, { lng: 0, lat: 10 })).toBe(0)
  expect(worldBearing({ lng: 0, lat: 0 }, { lng: 0, lat: -10 })).toBeCloseTo(Math.PI)
})

test("world distance better func", () => {
  expect(worldDist({ lng: 0, lat: 0 }, { lng: 0, lat: 0 })).toBeCloseTo(0)
  expect(worldDist({ lng: 0, lat: 0 }, { lng: 20, lat: 20 })).toBeCloseTo(3112445.04)
  expect(worldDist({ lng: 20, lat: 20 }, { lng: 0, lat: 0 })).toBeCloseTo(3112445.04)
  expect(worldDist({ lng: 0, lat: 0 }, { lng: 90, lat: 0 })).toBeCloseTo(10007543.4)
  expect(worldDist({ lng: 0, lat: 0 }, { lng: 90, lat: 40 })).toBeCloseTo(10007543.4)
  expect(worldDist({ lat: 40.7128, lng: 74.006 }, { lat: 51.5072, lng: 0.1276 })).toBeCloseTo(5570242.31)
})

test("dist", () => {
  expect(dist({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0)
  expect(dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  expect(dist({ x: -1, y: -1 }, { x: 2, y: 3 })).toBe(5)
  expect(dist({ x: 1, y: 1 }, { x: -2, y: -3 })).toBe(5)
})

test("deg2rad", () => {
  expect(deg2rad(0)).toBe(0)
  expect(deg2rad(90)).toBe(Math.PI / 2)
  expect(deg2rad(180)).toBe(Math.PI)
  expect(deg2rad(360)).toBe(Math.PI * 2)
  expect(deg2rad(-180)).toBe(-Math.PI)
})

test("rad2deg", () => {
  expect(rad2deg(0)).toBe(0)
  expect(rad2deg(Math.PI / 2)).toBe(90)
  expect(rad2deg(Math.PI)).toBe(180)
  expect(rad2deg(Math.PI * 2)).toBe(360)
  expect(rad2deg(-Math.PI)).toBe(-180)
})

