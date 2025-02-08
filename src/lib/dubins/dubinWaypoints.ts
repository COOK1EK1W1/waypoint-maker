import { Waypoint } from "@/types/waypoints";
import { deg2rad, modf, offset, rad2deg } from "./geometry";
import { Dir, DubinsBetweenDiffRad } from "./dubins";
import { bound, dubinsPoint, LatLng, Path, Segment, XY } from "@/types/dubins";
import { g2l, l2g } from "../world/conversion";
import { Plane, Vehicle } from "@/types/vehicleType";

/*
 * find all the sections of a waypoint list which require a dubins path between
 * include pre + post waypoints to connect
 */
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

export function localisePath(path: Path<XY>, reference: LatLng): Path<LatLng> {
  let newPath: Path<LatLng> = []
  for (let segment of path) {
    switch (segment.type) {
      case "Curve": {
        let { center, ...rest } = segment
        let newCenter = l2g(reference, { x: center.x, y: center.y })
        let newSegment: Segment<LatLng> = { ...rest, center: newCenter }
        newPath.push(newSegment)
        break;
      }
      case "Straight": {
        let { start, end, ...rest } = segment
        let newStart = l2g(reference, { x: start.x, y: start.y })
        let newEnd = l2g(reference, { x: end.x, y: end.y })
        let newSegment: Segment<LatLng> = { ...rest, end: newEnd, start: newStart }
        newPath.push(newSegment)
        break
      }
    }
  }
  return newPath
}

export function dubinsBetweenWaypoint(a: Waypoint, b: Waypoint, reference: LatLng): Path<LatLng> {
  const start = g2l(reference, { lat: a.param5, lng: a.param6 })
  const end = g2l(reference, { lat: b.param5, lng: b.param6 })
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

export function getTunableDubinsParameters(wps: dubinsPoint[]): number[] {
  let ret: number[] = []
  for (const waypoint of wps) {
    if (waypoint.tunable) {
      ret.push(deg2rad(waypoint.heading))
      ret.push(waypoint.radius)
    }
  }
  return ret
}

export function getMinTurnRadius(maxBank: number, velocity: number) {
  return Math.pow(velocity, 2) / (9.8 * Math.tan((maxBank * Math.PI) / 180))
}

export function getBounds(wps: Waypoint[], vehicle: Plane): bound[] {
  let bounds = []
  for (const waypoint of wps) {
    if (waypoint.type == 69) {
      bounds.push({ min: 0, max: 6.28, circular: true })
      bounds.push({ min: getMinTurnRadius(vehicle.maxBank, vehicle.cruiseAirspeed) })
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

export function waypointToDubins(wp: Waypoint, reference: LatLng): dubinsPoint {
  if (wp.type == 69) {
    return { pos: g2l(reference, { lat: wp.param5, lng: wp.param6 }), bounds: {}, radius: wp.param3, heading: wp.param2, tunable: true, passbyRadius: wp.param1 }
  } else {
    return { pos: g2l(reference, { lat: wp.param5, lng: wp.param6 }), bounds: {}, radius: 0, heading: wp.param2, tunable: false, passbyRadius: wp.param1 }
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

export function setTunableDubinsParameter(wps: dubinsPoint[], params: number[]): void {
  let paramI = 0
  for (let i = 0; i < wps.length; i++) {
    let cur = wps[i]
    if (cur.tunable) {
      // radians
      cur.heading = rad2deg(params[paramI++])
      cur.radius = params[paramI++]
    }

  }
}
