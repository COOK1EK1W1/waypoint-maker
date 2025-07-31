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

  expect(path.error).toBeNull()
  if (path.error){
    return
  }

  expect(path.data.turnA.theta).toBeCloseTo(0)
  expect(path.data.turnA.radius).toBe(1)

  if (path.data.straight.type == "Straight") {
    expect(path.data.straight.start.x).toBeCloseTo(0)
    expect(path.data.straight.start.y).toBeCloseTo(0)
    expect(path.data.straight.end.x).toBeCloseTo(0)
    expect(path.data.straight.end.y).toBeCloseTo(10)
  }

  if (path.data.turnB.type == "Curve") {
    expect(path.data.turnB.theta).toBeCloseTo(0)
    expect(path.data.turnB.radius).toBe(1)
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

  expect(path.error).toBeNull()
  if (path.error){
    return
  }

  expect(path.data.turnA.theta).toBeCloseTo(0)
  expect(path.data.turnA.radius).toBe(1)

  expect(path.data.straight.start.x).toBeCloseTo(0)
  expect(path.data.straight.start.y).toBeCloseTo(0)
  expect(path.data.straight.end.x).toBeCloseTo(10)
  expect(path.data.straight.end.y).toBeCloseTo(0)

  expect(path.data.turnB.theta).toBeCloseTo(0)
  expect(path.data.turnB.radius).toBe(1)
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

  expect(path.error).toBeNull()
  if (path.error){
    return
  }

  expect(Math.abs(path.data.turnA.theta)).toBeCloseTo(Math.PI / 2)
  expect(path.data.turnA.radius).toBe(1)

  expect(path.data.straight.start.x).toBeCloseTo(1)
  expect(Math.abs(path.data.straight.start.y)).toBeCloseTo(1)
  expect(path.data.straight.end.x).toBeCloseTo(9)
  expect(Math.abs(path.data.straight.end.y)).toBeCloseTo(1)

  expect(Math.abs(path.data.turnB.theta)).toBeCloseTo(Math.PI / 2)
  expect(path.data.turnB.radius).toBe(1)
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

  expect(path.error).toBeNull()
  if (path.error){
    return
  }

  expect(Math.abs(path.data.turnA.theta)).toBeCloseTo(Math.PI / 2)
  expect(path.data.turnA.radius).toBe(1)

  expect(path.data.straight.start.x).toBeCloseTo(-1)
  expect(path.data.straight.start.y).toBeCloseTo(1)
  expect(path.data.straight.end.x).toBeCloseTo(-9)
  expect(Math.abs(path.data.straight.end.y)).toBeCloseTo(1)

  expect(Math.abs(path.data.turnB.theta)).toBeCloseTo(Math.PI / 2)
  expect(path.data.turnB.radius).toBe(1)
})