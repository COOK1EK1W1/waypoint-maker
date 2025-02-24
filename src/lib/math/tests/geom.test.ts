import { expect, test } from "bun:test";
import { bearing, deg2rad, dist, mod2pi, modf, offset, rad2deg } from "@/lib/math/geometry"

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

test("dist", () => {
  expect(dist({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0)
  expect(dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  expect(dist({ x: -1, y: -1 }, { x: 2, y: 3 })).toBe(5)
  expect(dist({ x: 1, y: 1 }, { x: -2, y: -3 })).toBe(5)
})

