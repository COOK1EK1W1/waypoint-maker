import { expect, test } from "bun:test";
import { Segment, XY } from "@/types/dubins";
import { findCenters } from "@/lib/dubins/dubins";

test("find dubins centers", () => {
  let a = findCenters({ x: 0, y: 0 }, 0, 0)
  expect(a.r.x).toBe(0)
  expect(a.r.y).toBe(0)
  expect(a.l.x).toBe(0)
  expect(a.l.y).toBe(0)

  let b = findCenters({ x: 0, y: 0 }, 0, 1000)
  expect(b.r.x).toBeCloseTo(0.009085, 3)
  expect(b.r.y).toBeCloseTo(0)
  expect(b.l.x).toBeCloseTo(-0.009085, 3)
  expect(b.l.y).toBeCloseTo(0)

  let c = findCenters({ x: 0, y: 0 }, Math.PI / 2, 1000)
  expect(c.r.x).toBeCloseTo(0)
  expect(c.r.y).toBeCloseTo(-0.009085)
  expect(c.l.x).toBeCloseTo(0)
  expect(c.l.y).toBeCloseTo(0.009085)
})
