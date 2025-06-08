import { modf, offset } from "@/lib/math/geometry"
import { DubinsBetweenDiffRad } from "./dubins";
import { g2l, l2g } from "@/lib/world/conversion";
import { crossProduct } from "@/lib/mission/fns";
import { deg2rad } from "@/lib/math/geometry";
import { bound, dubinsPoint, Path, Segment } from "./types";
import { XY } from "@/lib/math/types";
import { Command, LatLngAltCommand, LatLngCommand } from "../commands/commands";
import { Plane } from "../vehicles/types";
import { getLatLng, LatLng } from "../world/latlng";
import { MainLine } from "../mission/mission";

/*
 * find all the sections of a waypoint list which require a dubins path between
 * include pre + post waypoints to connect
 */
export function splitDubinsRuns(mainLine: MainLine): { start: number, run: { cmd: LatLngAltCommand, id: number, other: Command[] }[] }[] {
  let dubinSections: { start: number, run: { cmd: LatLngAltCommand, id: number, other: Command[] }[] }[] = []

  let curSection: MainLine = []
  let start = 0
  for (let i = 0; i < mainLine.length; i++) {
    const curWaypoint = mainLine[i].cmd
    if (curWaypoint.type == 69) {
      if (curSection.length == 0) {
        start = i
        if (i > 0) {
          curSection.push(mainLine[i - 1])
        }
      }
      curSection.push(mainLine[i])
    } else {
      if (curSection.length > 0) {
        if (i < mainLine.length) {
          curSection.push(mainLine[i])
        }
        dubinSections.push({ start: start, run: curSection })
        curSection = []
      }
    }
  }
  if (curSection.length > 0) {
    dubinSections.push({ start: start, run: curSection })
  }
  return dubinSections

}

/**
 * Converts a path from local XY coordinates to global latitude/longitude coordinates
 * @param {Path<XY>} path - The path in local XY coordinates
 * @param {LatLng} reference - The reference point used for coordinate conversion
 * @returns {Path<LatLng>} The path converted to latitude/longitude coordinates
 */
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

/**
 * Generates a Dubins path between a list of waypoints
 * @param {dubinsPoint[]} wps - The list of waypoints
 * @returns {Path<XY>} The Dubins path
 */
export function dubinsBetweenDubins(wps: dubinsPoint[]): Path<XY> {
  let path: Path<XY> = []
  for (let i = 0; i < wps.length - 1; i++) {
    const a = wps[i]
    const b = wps[i + 1]

    let adir = 0;
    let bdir = 0

    //figure out offset direction
    if (i > 0) {
      adir = crossProduct(wps[i - 1].pos, a.pos, b.pos) > 0 ? 1 : -1 // clamp to 1 and -1
    }
    if (i < wps.length - 2) {
      bdir = crossProduct(a.pos, b.pos, wps[i + 2].pos) > 0 ? 1 : -1
    }

    let offsetA = offset(a.pos, a.passbyRadius * adir, deg2rad(a.heading + 90))
    let offsetB = offset(b.pos, b.passbyRadius * bdir, deg2rad(b.heading + 90))
    path = path.concat(DubinsBetweenDiffRad(offsetA, offsetB, deg2rad(a.heading), deg2rad(b.heading), a.radius, b.radius))
  }
  return path
}

/**
 * Extracts the tunable parameters from a list of waypoints
 * @param {dubinsPoint[]} wps - The list of waypoints
 * @returns {number[]} The tunable parameters
 */
export function getTunableDubinsParameters(wps: dubinsPoint[]): number[] {
  // heading | radius
  let ret: number[] = []
  for (const waypoint of wps) {
    if (waypoint.tunable) {
      ret.push(waypoint.heading)
      ret.push(waypoint.radius)
    }
  }
  return ret
}

/**
 * Calculates the minimum turn radius based on the maximum bank angle and velocity
 * @param {number} maxBank - The maximum bank angle
 * @param {number} velocity - The velocity
 * @returns {number} The minimum turn radius
 */
export function getMinTurnRadius(maxBank: number, velocity: number): number {
  return Math.pow(velocity, 2) / (9.8 * Math.tan(deg2rad(maxBank)))
}

/**
 * Calculates the bounds for the tunable parameters of a list of waypoints
 * @param {dubinsPoint[]} wps - The list of waypoints
 * @param {Plane} vehicle - The vehicle type
 * @returns {bound[]} The bounds for the tunable parameters
 */
export function getBounds(wps: dubinsPoint[], vehicle: Plane): bound[] {
  // heading | radius
  const bounds = []
  for (const waypoint of wps) {
    if (waypoint.tunable) {
      bounds.push({ min: 0, max: 360, circular: true })
      bounds.push({ min: Math.max(getMinTurnRadius(vehicle.maxBank, vehicle.cruiseAirspeed), waypoint.passbyRadius) })
    }
  }
  return bounds
}

/**
 * Applies bounds to the tunable parameters
 * @param {number[]} params - The tunable parameters
 * @param {bound[]} bounds - The bounds for the tunable parameters
 */
export function applyBounds(params: number[], bounds: bound[]): void {
  for (let i = 0; i < bounds.length; i++) {
    let bound = bounds[i]
    if (bound.min != undefined && bound.max != undefined && bound.circular) {
      let range = bound.max - bound.min
      let diff = params[i] - bound.min
      params[i] = bound.min + modf(diff, range)
    } else if (bound.min != undefined && params[i] < bound.min) {
      params[i] = bound.min
    } else if (bound.max != undefined && params[i] > bound.max) {
      params[i] = bound.max
    }
  }
}

/**
 * Converts a waypoint to a dubins point, Dubins points are in local XY coordinates
 * @param {LatLngCommand} cmd - The command with position
 * @param {LatLng} reference - The reference point used for coordinate conversion
 * @returns {dubinsPoint} The dubins point
 */
export function waypointToDubins(cmd: LatLngCommand, reference: LatLng): dubinsPoint {
  if (cmd.type == 69) {
    return { pos: g2l(reference, getLatLng(cmd)), bounds: {}, radius: cmd.params.radius, heading: cmd.params.heading, tunable: true, passbyRadius: cmd.params["fly-by distance"] }
  } else {
    return { pos: g2l(reference, getLatLng(cmd)), bounds: {}, radius: 0, heading: 0, tunable: false, passbyRadius: 0 }
  }
}

/**
 * Sets the tunable parameters for a list of waypoints
 * @param {Waypoint[]} wps - The list of waypoints
 * @param {number[]} params - The tunable parameters
 */
export function setTunableParameter(wps: MainLine, params: number[]): void {
  let paramI = 0
  for (let i = 0; i < wps.length; i++) {
    let cur = wps[i]
    if (cur.cmd.type == 69) {
      // radians
      cur.cmd.params.heading = modf(params[paramI++], 360)
      cur.cmd.params.radius = params[paramI++]
    }
  }
}

/**
 * Sets the tunable parameters for a list of dubins points
 * @param {dubinsPoint[]} wps - The list of dubins points
 * @param {number[]} params - The tunable parameters
 */
export function setTunableDubinsParameter(wps: dubinsPoint[], params: number[]): void {
  let paramI = 0
  for (let i = 0; i < wps.length; i++) {
    let cur = wps[i]
    if (cur.tunable) {
      // radians
      cur.heading = modf(params[paramI++], 360)
      cur.radius = params[paramI++]
    }
  }
}
