import { expect, test } from "bun:test";
import { applyBounds, dubinsBetweenDubins, getBounds, getMinTurnRadius, getTunableDubinsParameters, localisePath, splitDubinsRuns } from "@/lib/dubins/dubinWaypoints";
import { defaultWaypoint } from "@/lib/mission/defaults";
import { XY } from "@/lib/math/types";
import { dubinsPoint, Path } from "../types";
import { Command } from "@/lib/commands/commands";
import { defaultPlane } from "@/lib/vehicles/defaults";


test("Split Dubins runs empty", () => {
  const a: Command[] = []
  let runs = splitDubinsRuns(a)
  expect(runs.length).toBe(0)
})

test("Split Dubins runs no runs", () => {
  const a: Command[] = []
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  let runs = splitDubinsRuns(a)
  expect(runs.length).toBe(0)
})

test("Split Dubins runs sandwich 1", () => {
  const a: Command[] = []
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a[1].type = 69
  a[1].frame = 33
  let runs = splitDubinsRuns(a)

  expect(runs.length).toBe(1)
  expect(runs[0].start).toBe(1)
  expect(runs[0].wps.length).toBe(3)
  expect(runs[0].wps[1].frame).toBe(33)
})


test("Split Dubins runs end dubins", () => {
  const a: Command[] = []
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a[2].type = 69
  a[2].frame = 33
  let runs = splitDubinsRuns(a)

  expect(runs.length).toBe(1)
  expect(runs[0].start).toBe(2)
  expect(runs[0].wps.length).toBe(2)
  expect(runs[0].wps[1].frame).toBe(33)
})

test("Split Dubins runs start + end", () => {
  const a: Command[] = []
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a[0].type = 69
  a[0].frame = 31
  a[2].type = 69
  a[2].frame = 33
  let runs = splitDubinsRuns(a)

  expect(runs.length).toBe(2)
  expect(runs[0].start).toBe(0)
  expect(runs[0].wps.length).toBe(2)
  expect(runs[0].wps[0].frame).toBe(31)
  expect(runs[0].wps[1].frame).toBe(3)

  expect(runs[1].start).toBe(2)
  expect(runs[1].wps.length).toBe(2)
  expect(runs[1].wps[0].frame).toBe(3)
  expect(runs[1].wps[1].frame).toBe(33)
})


test("Split Dubins runs all dubins", () => {
  const a: Command[] = []
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a[0].type = 69
  a[1].type = 69
  a[2].type = 69
  let runs = splitDubinsRuns(a)

  expect(runs.length).toBe(1)
  expect(runs[0].start).toBe(0)
  expect(runs[0].wps.length).toBe(3)
})

test("get min turn radius", () => {
  expect(getMinTurnRadius(30, 0)).toBeCloseTo(0)
  expect(getMinTurnRadius(0, 10)).toBe(Infinity)
  expect(getMinTurnRadius(90, 10)).toBeCloseTo(0)
})

test("localise Path", () => {
  let path: Path<XY> = [
    { type: "Straight", start: { x: 0, y: 0 }, end: { x: 1000, y: 0 } },
    { type: "Curve", start: 0, center: { x: 0, y: 0 }, theta: Math.PI, radius: 1000 }
  ]

  let localised = localisePath(path, { lat: 56, lng: -3 })
  expect(localised.length).toBe(path.length)

  expect(localised[0].type).toBe("Straight")
  if (localised[0].type != "Straight") return
  expect(localised[0].start).toEqual({ lat: 56, lng: -3 })
  expect(localised[0].end.lat).toEqual(56)
  expect(localised[0].end.lng).toBeGreaterThan(-3)

  expect(localised[1].type).toBe("Curve")
  if (localised[1].type != "Curve") return
  expect(localised[1].start).toBe(0)
  expect(localised[1].theta).toBe(Math.PI)
  expect(localised[1].radius).toBe(1000)
  expect(localised[1].center).toEqual({ lat: 56, lng: -3 })
})

test("Dubins between dubins", () => {
  const points: dubinsPoint[] = [
    { tunable: false, pos: { x: 0, y: 0 }, radius: 4, bounds: {}, heading: 0, passbyRadius: 0 },
    { tunable: false, pos: { x: 0, y: 10 }, radius: 4, bounds: {}, heading: 0, passbyRadius: 0 },
    { tunable: false, pos: { x: 10, y: 10 }, radius: 4, bounds: {}, heading: 180, passbyRadius: 0 }
  ]

  const path = dubinsBetweenDubins(points)

  expect(path.length).toBe(6)
  expect(path[0].type).toBe("Curve")
  expect(path[1].type).toBe("Straight")
  expect(path[2].type).toBe("Curve")
  expect(path[3].type).toBe("Curve")
  expect(path[4].type).toBe("Straight")
  expect(path[5].type).toBe("Curve")

  if (path[1].type != "Straight") return
  if (path[4].type != "Straight") return

  //straights
  expect(path[1].start.x).toBeCloseTo(0)
  expect(path[1].start.y).toBeCloseTo(0)
  expect(path[1].end.x).toBeCloseTo(0)
  expect(path[1].end.y).toBeCloseTo(10)
  expect(path[4].start.x).toBeCloseTo(4)
  expect(path[4].start.y).toBeCloseTo(14)
  expect(path[4].end.x).toBeCloseTo(6)
  expect(path[4].end.y).toBeCloseTo(14)

  if (path[0].type != "Curve") return
  if (path[5].type != "Curve") return
  //curves
  expect(path[0].theta).toBeCloseTo(0)
  expect(path[5].theta).toBeCloseTo(Math.PI / 2)
  expect(path[5].start).toBeCloseTo(0)
  expect(path[5].center.x).toBeCloseTo(6)
  expect(path[5].center.y).toBeCloseTo(10)
})


test("get tunable params", () => {
  const points: dubinsPoint[] = [
    { tunable: true, pos: { x: 0, y: 0 }, radius: 4, bounds: {}, heading: 0, passbyRadius: 0 },
    { tunable: true, pos: { x: 0, y: 10 }, radius: 10, bounds: {}, heading: 180, passbyRadius: 0 },
    { tunable: false, pos: { x: 10, y: 10 }, radius: 6, bounds: {}, heading: 270, passbyRadius: 0 }
  ]
  const params = getTunableDubinsParameters(points)
  expect(params.length).toBe(4)
  expect(params[0]).toBe(0)
  expect(params[1]).toBe(4)
  expect(params[2]).toBe(180)
  expect(params[3]).toBe(10)
})



test("get bounds for dubins", () => {
  const points: dubinsPoint[] = [
    { tunable: true, pos: { x: 0, y: 0 }, radius: 4, bounds: {}, heading: 0, passbyRadius: 0 },
    { tunable: true, pos: { x: 0, y: 10 }, radius: 10, bounds: {}, heading: 180, passbyRadius: 0 },
    { tunable: false, pos: { x: 10, y: 10 }, radius: 6, bounds: {}, heading: 270, passbyRadius: 0 }
  ]
  const bounds = getBounds(points, defaultPlane)
  expect(bounds.length).toBe(4)
  expect(bounds[0].circular).toBe(true)
  expect(bounds[0].min).toBe(0)
  expect(bounds[0].max).toBe(360)
  expect(bounds[1].min).toBeCloseTo(51.0778, 2)
  expect(bounds[2].circular).toBe(true)
  expect(bounds[3].min).toBeCloseTo(51.0778, 2)
})

test("apply bounds to dubins", () => {
  const points: dubinsPoint[] = [
    { tunable: true, pos: { x: 0, y: 0 }, radius: 4, bounds: {}, heading: 0, passbyRadius: 0 },
    { tunable: true, pos: { x: 0, y: 10 }, radius: 10, bounds: {}, heading: 180, passbyRadius: 0 },
    { tunable: false, pos: { x: 10, y: 10 }, radius: 6, bounds: {}, heading: 270, passbyRadius: 0 }
  ]
  let params = [1, 58, -90, -1]
  let bounds = getBounds(points, defaultPlane)
  applyBounds(params, bounds)
  expect(params[0]).toBe(1)
  expect(params[1]).toBe(58)
  expect(params[2]).toBe(270)
  expect(params[3]).toBeCloseTo(51.0778, 2)
})
/*
 
    test("waypoint to dubins", () => {
  function waypointToDubins(wp: Waypoint, reference: LatLng): dubinsPoint {
  }
}
 
    test("set tunable parameters", () => {
  function setTunableParameter(wps: Waypoint[], params: number[]): void {
  }
}
 
    test("set tunable parameters", () => {
  function setTunableDubinsParameter(wps: dubinsPoint[], params: number[]): void {
  }
}
*/
