import { expect, test } from "bun:test";
import { applyBounds, dubinsBetweenDubins, getBounds, getMinTurnRadius, getTunableDubinsParameters, localisePath, splitDubinsRuns } from "@/lib/dubins/dubinWaypoints";
import { XY } from "@/lib/math/types";
import { dubinsPoint, Path } from "../types";
import { defaultPlane } from "@/lib/vehicles/defaults";
import { makeCommand } from "@/lib/commands/default";
import { MainLine } from "@/lib/mission/mission";


test("Split Dubins runs empty", () => {
  const a: MainLine = []
  let runs = splitDubinsRuns(a)
  expect(runs.length).toBe(0)
})

test("Split Dubins runs no runs", () => {
  const a: MainLine = []
  a.push({ cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 0, longitude: 0 }), id: 0, other: [] })
  a.push({ cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 0, longitude: 0 }), id: 1, other: [] })
  a.push({ cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 0, longitude: 0 }), id: 2, other: [] })
  let runs = splitDubinsRuns(a)
  expect(runs.length).toBe(0)
})

test("Split Dubins runs sandwich 1", () => {
  const a: MainLine = []
  a.push({ cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 0, longitude: 0 }), id: 0, other: [] })
  a.push({ cmd: makeCommand("WM_CMD_NAV_DUBINS", { latitude: 0, longitude: 0 }), id: 1, other: [] })
  a.push({ cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 0, longitude: 0 }), id: 2, other: [] })
  a[1].cmd.frame = 0
  let runs = splitDubinsRuns(a)

  expect(runs.length).toBe(1)
  expect(runs[0].start).toBe(1)
  expect(runs[0].run.length).toBe(3)
  expect(runs[0].run[1].cmd.frame).toBe(0)
})


test("Split Dubins runs end dubins", () => {
  const a: MainLine = []
  a.push({ cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 0, longitude: 0 }), id: 0, other: [] })
  a.push({ cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 0, longitude: 0 }), id: 1, other: [] })
  a.push({ cmd: makeCommand("WM_CMD_NAV_DUBINS", { latitude: 0, longitude: 0 }), id: 2, other: [] })
  a[2].cmd.frame = 0
  let runs = splitDubinsRuns(a)

  expect(runs.length).toBe(1)
  expect(runs[0].start).toBe(2)
  expect(runs[0].run.length).toBe(2)
  expect(runs[0].run[1].cmd.frame).toBe(0)
})

test("Split Dubins runs start + end", () => {
  const a: MainLine = []
  a.push({ cmd: makeCommand("WM_CMD_NAV_DUBINS", { latitude: 0, longitude: 0 }), id: 0, other: [] })
  a.push({ cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 0, longitude: 0 }), id: 1, other: [] })
  a.push({ cmd: makeCommand("WM_CMD_NAV_DUBINS", { latitude: 0, longitude: 0 }), id: 2, other: [] })
  a[0].cmd.frame = 0
  a[2].cmd.frame = 10
  let runs = splitDubinsRuns(a)

  expect(runs.length).toBe(2)
  expect(runs[0].start).toBe(0)
  expect(runs[0].run.length).toBe(2)
  expect(runs[0].run[0].cmd.frame).toBe(0)
  expect(runs[0].run[1].cmd.frame).toBe(3)

  expect(runs[1].start).toBe(2)
  expect(runs[1].run.length).toBe(2)
  expect(runs[1].run[0].cmd.frame).toBe(3)
  expect(runs[1].run[1].cmd.frame).toBe(10)
})


test("Split Dubins runs all dubins", () => {
  const a: MainLine = []
  a.push({ cmd: makeCommand("WM_CMD_NAV_DUBINS", { latitude: 0, longitude: 0 }), id: 0, other: [] })
  a.push({ cmd: makeCommand("WM_CMD_NAV_DUBINS", { latitude: 0, longitude: 0 }), id: 1, other: [] })
  a.push({ cmd: makeCommand("WM_CMD_NAV_DUBINS", { latitude: 0, longitude: 0 }), id: 2, other: [] })
  let runs = splitDubinsRuns(a)

  expect(runs.length).toBe(1)
  expect(runs[0].start).toBe(0)
  expect(runs[0].run.length).toBe(3)
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

  expect(path.length).toBe(2)

  //straights
  expect(path[0].straight.start.x).toBeCloseTo(0)
  expect(path[0].straight.start.y).toBeCloseTo(0)
  expect(path[0].straight.end.x).toBeCloseTo(0)
  expect(path[0].straight.end.y).toBeCloseTo(10)
  expect(path[1].straight.start.x).toBeCloseTo(4)
  expect(path[1].straight.start.y).toBeCloseTo(14)
  expect(path[1].straight.end.x).toBeCloseTo(6)
  expect(path[1].straight.end.y).toBeCloseTo(14)

  //curves
  expect(path[0].turnA.theta).toBeCloseTo(0)
  expect(path[1].turnB.theta).toBeCloseTo(Math.PI / 2)
  expect(path[1].turnB.start).toBeCloseTo(0)
  expect(path[1].turnB.center.x).toBeCloseTo(6)
  expect(path[1].turnB.center.y).toBeCloseTo(10)
})


