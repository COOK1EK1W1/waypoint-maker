import { expect, test } from "bun:test";
import { dubinsPoint } from "../dubins/types";
import { getBounds, getTunableDubinsParameters, setTunableDubinsParameter } from "../dubins/dubinWaypoints";
import { defaultPlane } from "../vehicles/defaults";

const points1 = (): dubinsPoint[] => ([
  { tunable: true, pos: { x: 0, y: 0 }, radius: 0, bounds: {}, heading: 0, passbyRadius: 0 },
  { tunable: true, pos: { x: 0, y: 10 }, radius: 0, bounds: {}, heading: 0, passbyRadius: 0 },
  { tunable: true, pos: { x: 10, y: 10 }, radius: 0, bounds: {}, heading: 0, passbyRadius: 0 }
])

test("get tunable params", () => {
  const params = getTunableDubinsParameters(points1())
  expect(params.length % 3).toBe(0)
  expect(params.length).toBeGreaterThan(0)
})

test("set tunable params", () => {
  for (let i = 0; i < 3; i++) {
    let doesSomething = false

    // radius
    {
      let p1 = points1()
      p1[i].radius = 1
      const params = getTunableDubinsParameters(p1)
      let p2 = points1()
      setTunableDubinsParameter(p2, params)
      doesSomething = doesSomething || (p2[i].radius == 1)
      p2[i].radius = 0
      expect(p2).toEqual(points1())
    }

    // heading
    {
      let p1 = points1()
      p1[i].heading = 1
      const params = getTunableDubinsParameters(p1)
      let p2 = points1()
      setTunableDubinsParameter(p2, params)
      doesSomething = doesSomething || (p2[i].heading == 1)
      p2[i].heading = 0
      expect(p2).toEqual(points1())
    }

    // passby
    {
      let p1 = points1()
      p1[i].passbyRadius = 1
      const params = getTunableDubinsParameters(p1)
      let p2 = points1()
      setTunableDubinsParameter(p2, params)
      doesSomething = doesSomething || (p2[i].passbyRadius == 1)
      p2[i].passbyRadius = 0
      expect(p2).toEqual(points1())
    }
    expect(doesSomething).toBe(true)

  }
})

test("get params bounds", () => {
  const b = getBounds(points1(), defaultPlane)
  const p = getTunableDubinsParameters(points1())
  expect(b.length).toBeGreaterThan(0)
  expect(b.length % 3).toEqual(0)
  expect(b.length).toEqual(p.length)
})

