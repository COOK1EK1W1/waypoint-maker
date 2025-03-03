import { XY } from "../math/types";
import { pathLength } from "./geometry";
import { mod2pi, bearing, offset, dist } from "@/lib/math/geometry"
import { Curve, Path, Straight } from "./types";

export enum Dir {
  Left,
  Right,
}

/**
 * Find the turn centers of a waypoint
 * @param {XY} a - The waypoint
 * @param {number} heading - The bearing of the waypoint
 * @ param {number} dist (m) - The distance the centers are away from the waypoint
 */
export function findCenters(a: XY, heading: number, dist: number): { l: XY, r: XY } {
  return {
    l: offset(a, dist, heading - Math.PI / 2),
    r: offset(a, dist, heading + Math.PI / 2)
  }
}

/**
 * Find the Shortest Path between two waypoints with defined headings and turn radii
 * This function operates in 2D local space
 * @param {XY} a - First waypoint (A)
 * @param {XY} b - Second waypoint (B)
 * @param {number} thetaA - the bearing for waypoint A
 * @param {number} thetaB - the bearing for waypoint B
 * @param {number} radA - The radius coming out of waypoint A
 * @param {number} radB - The radius coming into waypoint B
 */
export function DubinsBetweenDiffRad(a: XY, b: XY, thetaA: number, thetaB: number, radA: number, radB: number, Adir?: Dir, Bdir?: Dir): Path<XY> {

  // nomalise angles
  thetaA = mod2pi(thetaA)
  thetaB = mod2pi(thetaB)

  // find the centers for starting and ending
  const a_centers = findCenters(a, thetaA, radA)
  const b_centers = findCenters(b, thetaB, radB)

  let sections: Path<XY>[] = []

  // the angles for first curves
  let left_start = thetaA + Math.PI / 2
  let right_start = thetaA - Math.PI / 2

  //RSR
  if ((Adir != Dir.Left) && (Bdir != Dir.Left) && dist(a_centers.r, b_centers.r) > Math.abs(radA - radB)) {
    const ar2br = bearing(a_centers.r, b_centers.r)
    let a = Math.asin((radA - radB) / dist(a_centers.r, b_centers.r)) + ar2br
    let c1: Curve<XY> = {
      type: "Curve",
      center: a_centers.r,
      radius: radA,
      start: right_start,
      theta: mod2pi(a - thetaA)
    }
    let s: Straight<XY> = {
      type: "Straight",
      start: offset(a_centers.r, radA, a - Math.PI / 2),
      end: offset(b_centers.r, radB, a - Math.PI / 2)
    }
    let c2: Curve<XY> = {
      type: "Curve",
      center: b_centers.r,
      radius: radB,
      start: a - Math.PI / 2,
      theta: mod2pi(thetaB - a)
    }
    let RSL: Path<XY> = [c1, s, c2]
    sections.push(RSL)
  }

  //LSL
  if ((Adir != Dir.Right) && (Bdir != Dir.Left) && dist(a_centers.l, b_centers.l) > Math.abs(radA - radB)) {
    const al2bl = bearing(a_centers.l, b_centers.l)
    let a = al2bl - Math.asin((radA - radB) / dist(a_centers.l, b_centers.l))
    let c1: Curve<XY> = {
      type: "Curve",
      center: a_centers.l,
      radius: radA,
      start: left_start,
      theta: mod2pi(a - thetaA) - Math.PI * 2
    }
    let s: Straight<XY> = {
      type: "Straight",
      start: offset(a_centers.l, radA, a + Math.PI / 2),
      end: offset(b_centers.l, radB, a + Math.PI / 2)
    }
    let c2: Curve<XY> = {
      type: "Curve",
      center: b_centers.l,
      radius: radB, start: a - 3 * (Math.PI / 2),
      theta: mod2pi(thetaB - a) - Math.PI * 2
    }
    let RSL: Path<XY> = [c1, s, c2]
    sections.push(RSL)
  }

  //RSL
  if ((Adir != Dir.Left) && (Bdir != Dir.Right) && dist(a_centers.r, b_centers.l) > Math.abs(radA + radB)) {
    const ar2bl = bearing(a_centers.r, b_centers.l)
    let a = Math.asin((radA + radB) / dist(a_centers.r, b_centers.l)) + ar2bl
    let c1: Curve<XY> = {
      type: "Curve",
      center: a_centers.r,
      radius: radA,
      start: right_start,
      theta: mod2pi(a - thetaA)
    }
    let s: Straight<XY> = {
      type: "Straight",
      start: offset(a_centers.r, radA, a - Math.PI / 2),
      end: offset(b_centers.l, -radB, a - Math.PI / 2)
    }
    let c2: Curve<XY> = {
      type: "Curve",
      center: b_centers.l,
      radius: radB,
      start: a - 3 * (Math.PI / 2),
      theta: mod2pi(thetaB - a) - Math.PI * 2
    }
    let RSL: Path<XY> = [c1, s, c2]
    sections.push(RSL)

  }

  //LSR
  if ((Adir != Dir.Right) && (Bdir != Dir.Left) && dist(a_centers.l, b_centers.r) > Math.abs(radA + radB)) {
    const al2br = bearing(a_centers.l, b_centers.r)
    let a = al2br - Math.asin((radA + radB) / dist(a_centers.l, b_centers.r))
    let c1: Curve<XY> = {
      type: "Curve",
      center: a_centers.l,
      radius: radA,
      start: left_start,
      theta: mod2pi(a - thetaA) - Math.PI * 2
    }
    let s: Straight<XY> = {
      type: "Straight",
      start: offset(a_centers.l, radA, a + Math.PI / 2),
      end: offset(b_centers.r, -radB, a + Math.PI / 2)
    }
    let c2: Curve<XY> = {
      type: "Curve",
      center: b_centers.r,
      radius: radB,
      start: a - Math.PI / 2,
      theta: mod2pi(thetaB - a)
    }
    let LSR: Path<XY> = [c1, s, c2]
    sections.push(LSR)
  }

  sections.sort((a, b) => pathLength(a) - pathLength(b))
  if (sections.length == 0) {
    console.log(thetaA, thetaB)
    console.log(Adir, Bdir)
  }
  console.assert(sections.length > 0);
  return sections[0]
}
