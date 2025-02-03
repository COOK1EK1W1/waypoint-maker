import { expect, test } from "bun:test";
import { splitDubinsRuns } from "./dubinWaypoints";
import { Waypoint } from "@/types/waypoints";
import { defaultWaypoint } from "../waypoints/defaults";


test("Split Dubins runs empty", () => {
  const a: Waypoint[] = []
  let runs = splitDubinsRuns(a)
  expect(runs.length).toBe(0)
})

test("Split Dubins runs no runs", () => {
  const a: Waypoint[] = []
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  a.push(defaultWaypoint({ lat: 0, lng: 0 }))
  let runs = splitDubinsRuns(a)
  expect(runs.length).toBe(0)
})

test("Split Dubins runs sandwich 1", () => {
  const a: Waypoint[] = []
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
  const a: Waypoint[] = []
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
  const a: Waypoint[] = []
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
  const a: Waypoint[] = []
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


