import { expect, test } from "bun:test";
import { DubinsBetweenDiffRad, findCenters } from "@/lib/dubins/dubins";

test("find dubins centers", () => {
  let a = findCenters({ x: 0, y: 0 }, 0, 0)
  expect(a.r.x).toBe(0)
  expect(a.r.y).toBe(0)
  expect(a.l.x).toBe(0)
  expect(a.l.y).toBe(0)

  let b = findCenters({ x: 0, y: 0 }, 0, 20)
  expect(b.r.x).toBeCloseTo(20, 5)
  expect(b.r.y).toBeCloseTo(0)
  expect(b.l.x).toBeCloseTo(-20, 5)
  expect(b.l.y).toBeCloseTo(0)

  let c = findCenters({ x: 0, y: 0 }, Math.PI / 2, 20)
  expect(c.r.x).toBeCloseTo(0)
  expect(c.r.y).toBeCloseTo(-20)
  expect(c.l.x).toBeCloseTo(0)
  expect(c.l.y).toBeCloseTo(20)

  let d = findCenters({ x: 2, y: 2 }, Math.PI / 2, 20)
  expect(d.r.x).toBeCloseTo(2)
  expect(d.r.y).toBeCloseTo(-18)
  expect(d.l.x).toBeCloseTo(2)
  expect(d.l.y).toBeCloseTo(22)
})

test("find dubins path straight up", () => {
  let path = DubinsBetweenDiffRad(
    { x: 0, y: 0 },
    { x: 0, y: 10 },
    0,
    0,
    1,
    1,
  )

  expect(path.length).toBe(3)
  expect(path[0].type).toBe("Curve")
  expect(path[1].type).toBe("Straight")
  expect(path[2].type).toBe("Curve")

  if (path[0].type == "Curve") {
    expect(path[0].theta).toBeCloseTo(0)
    expect(path[0].radius).toBe(1)
  }

  if (path[1].type == "Straight") {
    expect(path[1].start.x).toBeCloseTo(0)
    expect(path[1].start.y).toBeCloseTo(0)
    expect(path[1].end.x).toBeCloseTo(0)
    expect(path[1].end.y).toBeCloseTo(10)
  }

  if (path[2].type == "Curve") {
    expect(path[2].theta).toBeCloseTo(0)
    expect(path[2].radius).toBe(1)
  }
})

test("find dubins path straight east", () => {
  let path = DubinsBetweenDiffRad(
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    Math.PI / 2,
    Math.PI / 2,
    1,
    1,
  )

  expect(path.length).toBe(3)
  expect(path[0].type).toBe("Curve")
  expect(path[1].type).toBe("Straight")
  expect(path[2].type).toBe("Curve")

  if (path[0].type == "Curve") {
    expect(path[0].theta).toBeCloseTo(0)
    expect(path[0].radius).toBe(1)
  }

  if (path[1].type == "Straight") {
    expect(path[1].start.x).toBeCloseTo(0)
    expect(path[1].start.y).toBeCloseTo(0)
    expect(path[1].end.x).toBeCloseTo(10)
    expect(path[1].end.y).toBeCloseTo(0)
  }

  if (path[2].type == "Curve") {
    expect(path[2].theta).toBeCloseTo(0)
    expect(path[2].radius).toBe(1)
  }
})


test("find dubins path east", () => {
  let path = DubinsBetweenDiffRad(
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    0,
    Math.PI,
    1,
    1,
  )

  expect(path.length).toBe(3)
  expect(path[0].type).toBe("Curve")
  expect(path[1].type).toBe("Straight")
  expect(path[2].type).toBe("Curve")

  if (path[0].type == "Curve") {
    expect(Math.abs(path[0].theta)).toBeCloseTo(Math.PI / 2)
    expect(path[0].radius).toBe(1)
  }

  if (path[1].type == "Straight") {
    expect(path[1].start.x).toBeCloseTo(1)
    expect(Math.abs(path[1].start.y)).toBeCloseTo(1)
    expect(path[1].end.x).toBeCloseTo(9)
    expect(Math.abs(path[1].end.y)).toBeCloseTo(1)
  }

  if (path[2].type == "Curve") {
    expect(Math.abs(path[2].theta)).toBeCloseTo(Math.PI / 2)
    expect(path[2].radius).toBe(1)
  }
})


test("find dubins path west", () => {
  let path = DubinsBetweenDiffRad(
    { x: 0, y: 0 },
    { x: -10, y: 0 },
    0,
    Math.PI,
    1,
    1,
  )

  expect(path.length).toBe(3)
  expect(path[0].type).toBe("Curve")
  expect(path[1].type).toBe("Straight")
  expect(path[2].type).toBe("Curve")

  if (path[0].type == "Curve") {
    expect(Math.abs(path[0].theta)).toBeCloseTo(Math.PI / 2)
    expect(path[0].radius).toBe(1)
  }

  if (path[1].type == "Straight") {
    expect(path[1].start.x).toBeCloseTo(-1)
    expect(path[1].start.y).toBeCloseTo(1)
    expect(path[1].end.x).toBeCloseTo(-9)
    expect(Math.abs(path[1].end.y)).toBeCloseTo(1)
  }

  if (path[2].type == "Curve") {
    expect(Math.abs(path[2].theta)).toBeCloseTo(Math.PI / 2)
    expect(path[2].radius).toBe(1)
  }
})
