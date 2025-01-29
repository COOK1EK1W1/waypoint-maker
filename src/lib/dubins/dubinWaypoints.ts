import { Waypoint } from "@/types/waypoints";
import { deg2rad, modf, offset, rad2deg, worldOffset } from "./geometry";
import { Dir, DubinsBetweenDiffRad } from "./dubins";
import { bound, Path } from "@/types/dubins";
import { warn } from "console";
import { g2l, l2g } from "../world/conversion";

export function splitDubinsRuns(wps: Waypoint[]): { start: number, wps: Waypoint[] }[] {
  let dubinSections: { start: number, wps: Waypoint[] }[] = []

  let curSection: Waypoint[] = []
  let start = 0
  for (let i = 0; i < wps.length; i++) {
    const curWaypoint = wps[i]
    if (curWaypoint.type == 69) {
      if (curSection.length == 0) {
        start = i
        if (i > 0) {
          curSection.push(wps[i - 1])
        }
      }
      curSection.push(curWaypoint)
    } else {
      if (curSection.length > 0) {
        if (i < wps.length) {
          curSection.push(wps[i])
        }
        dubinSections.push({ start: start, wps: curSection })
        curSection = []
      }
    }
  }
  if (curSection.length > 0) {
    dubinSections.push({ start: start, wps: curSection })
  }
  return dubinSections

}

function num2dir(num: number) {
  if (num >= 1) {
    return Dir.Right
  }
  if (num <= -1) {
    return Dir.Left
  }
  return undefined
}

export function localisePath(path: Path, reference: Waypoint): Path {
  for (let segment of path) {
    switch (segment.type) {
      case "Curve": {
        let center = l2g({ lat: reference.param5, lng: reference.param6 }, { x: segment.center.x, y: segment.center.y })
        segment.center = { x: center.lng, y: center.lat }
        break;
      }
      case "Straight": {
        let start = l2g({ lat: reference.param5, lng: reference.param6 }, { x: segment.start.x, y: segment.start.y })
        segment.start = { x: start.lng, y: start.lat }
        let end = l2g({ lat: reference.param5, lng: reference.param6 }, { x: segment.end.x, y: segment.end.y })
        segment.end = { x: end.lng, y: end.lat }
        break
      }
    }
  }
  return path
}

export function dubinsBetweenWaypoint(a: Waypoint, b: Waypoint, reference: Waypoint): Path {
  const start = g2l({ lat: reference.param5, lng: reference.param6 }, { lat: a.param5, lng: a.param6 })
  const end = g2l({ lat: reference.param5, lng: reference.param6 }, { lat: b.param5, lng: b.param6 })
  if (a.type == 69) {
    let angleA = deg2rad(a.param2)
    if (b.type == 69) {
      let angleB = deg2rad(b.param2)
      let offset_a = offset(start, a.param1, angleA - Math.PI / 2)
      let offset_b = offset(end, b.param1, angleB - Math.PI / 2)
      let res = DubinsBetweenDiffRad(offset_a, offset_b, angleA, angleB, a.param3, b.param3, num2dir(a.param4), num2dir(b.param4))
      return localisePath(res, reference)
    } else {
      let offset_a = offset(start, a.param1, angleA - Math.PI / 2)
      let offset_b = end
      let res = DubinsBetweenDiffRad(offset_a, offset_b, angleA, 0, a.param3, 0, num2dir(a.param4), undefined)
      return localisePath(res, reference)
    }
  } else {
    if (b.type == 69) {
      let angleB = deg2rad(b.param2)
      let offset_a = start
      let offset_b = offset(end, b.param1, angleB - Math.PI / 2)
      let res = DubinsBetweenDiffRad(offset_a, offset_b, 0, angleB, 0, b.param3, undefined, num2dir(b.param4))
      return localisePath(res, reference)

    } else {
      return []
    }

  }
}

export function getTunableParameters(wps: Waypoint[]): number[] {
  let ret: number[] = []
  for (const waypoint of wps) {
    if (waypoint.type == 69) {
      ret.push(deg2rad(waypoint.param2))
      ret.push(waypoint.param3)
    }
  }
  return ret
}

export function getBounds(wps: Waypoint[]): bound[] {
  let bounds = []
  for (const waypoint of wps) {
    if (waypoint.type == 69) {
      bounds.push({ min: 0, max: 6.28, circular: true })
      bounds.push({ min: 50 })
    }
  }
  return bounds
}

export function applyBounds(params: number[], bounds: bound[]): void {
  for (let i = 0; i < bounds.length; i++) {
    let bound = bounds[i]
    if (bound.min && bound.max && bound.circular) {
      let range = bound.max - bound.min
      let diff = params[i] - bound.min
      params[i] = bound.min + modf(diff, range)
    }
    if (bound.min) {
      if (params[i] < bound.min) {
        params[i] = bound.min
      }
    }
    if (bound.max) {
      if (params[i] > bound.max) {
        params[i] = bound.max
      }
    }
  }
}

export function setTunableParameter(wps: Waypoint[], params: number[]): void {
  let paramI = 0
  for (let i = 0; i < wps.length; i++) {
    let cur = wps[i]
    if (cur.type == 69) {
      // radians
      cur.param2 = rad2deg(params[paramI++])
      cur.param3 = params[paramI++]
    }

  }

}
