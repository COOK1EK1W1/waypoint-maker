import { XY, Path, Curve, Straight } from "@/types/dubins";
import { mod2pi, world_dist, worldBearing, worldOffset, worldPathLength } from "./geometry";

export enum Dir {
  Left,
  Right,
}

/**
 * Find the turn centers of a waypoint
 * @param {XY} a - The waypoint
 * @param {number} dir - The bearing of the waypoint
 * @ param {number} dist - The distance the centers are away from the waypoint
 */
export function findCenters(a: XY, dir: number, dist: number): { l: XY, r: XY } {
  return {
    l: worldOffset(a, dist, dir - Math.PI / 2),
    r: worldOffset(a, dist, dir + Math.PI / 2)
  }
}

/**
 * Find the Shortest Path between two waypoints with defined headings and a set turn radius
 * @param {XY} a - First waypoint (A)
 * @param {XY} b - Second waypoint (B)
 * @param {number} thetaA - the bearing for waypoint A
 * @param {number} thetaB - the bearing for waypoint B
 * @param {number} turnRadius - The radius coming out of waypoint A
 */
export function DubinsBetween(a: XY, b: XY, thetaA: number, thetaB: number, turnRadius: number): Path {
  return DubinsBetweenDiffRad(a, b, thetaA, thetaB, turnRadius, turnRadius)
}

/**
 * Find the Shortest Path between two waypoints with defined headings and turn radii
 * @param {XY} a - First waypoint (A)
 * @param {XY} b - Second waypoint (B)
 * @param {number} thetaA - the bearing for waypoint A
 * @param {number} thetaB - the bearing for waypoint B
 * @param {number} radA - The radius coming out of waypoint A
 * @param {number} radB - The radius coming into waypoint B
 */
export function DubinsBetweenDiffRad(a: XY, b: XY, thetaA: number, thetaB: number, radA: number, radB: number, Adir?: Dir, Bdir?: Dir): Path {

  // nomalise angles
  thetaA = mod2pi(thetaA)
  thetaB = mod2pi(thetaB)

  // find the centers for starting and ending
  const a_centers = findCenters(a, thetaA, radA)
  const b_centers = findCenters(b, thetaB, radB)

  // find the bearing between all centers
  const ar2br = worldBearing(a_centers.r, b_centers.r)
  const al2bl = worldBearing(a_centers.l, b_centers.l)
  const ar2bl = worldBearing(a_centers.r, b_centers.l)
  const al2br = worldBearing(a_centers.l, b_centers.r)

  let sections: Path[] = []

  // the angles for first curves
  let left_start = thetaA + Math.PI / 2
  let right_start = thetaA - Math.PI / 2

  //RSR
  if ((Adir != Dir.Left) && (Bdir != Dir.Left) && world_dist(a_centers.r, b_centers.r) > Math.abs(radA - radB)) {
    let a = Math.asin((radA - radB) / world_dist(a_centers.r, b_centers.r)) + ar2br
    let c1: Curve = {
      type: "Curve",
      center: a_centers.r,
      radius: radA,
      start: right_start,
      theta: mod2pi(a - thetaA)
    }
    let s: Straight = {
      type: "Straight",
      start: worldOffset(a_centers.r, radA, a - Math.PI / 2),
      end: worldOffset(b_centers.r, radB, a - Math.PI / 2)
    }
    let c2: Curve = {
      type: "Curve",
      center: b_centers.r,
      radius: radB,
      start: a - Math.PI / 2,
      theta: mod2pi(thetaB - a)
    }
    let RSL: Path = [c1, s, c2]
    sections.push(RSL)
  }

  //LSL
  if ((Adir != Dir.Right) && (Bdir != Dir.Left) && world_dist(a_centers.l, b_centers.l) > Math.abs(radA - radB)) {
    let a = al2bl - Math.asin((radA - radB) / world_dist(a_centers.l, b_centers.l))
    let c1: Curve = {
      type: "Curve",
      center: a_centers.l,
      radius: radA,
      start: left_start,
      theta: mod2pi(a - thetaA) - Math.PI * 2
    }
    let s: Straight = {
      type: "Straight",
      start: worldOffset(a_centers.l, radA, a + Math.PI / 2),
      end: worldOffset(b_centers.l, radB, a + Math.PI / 2)
    }
    let c2: Curve = {
      type: "Curve",
      center: b_centers.l,
      radius: radB, start: a - 3 * (Math.PI / 2),
      theta: mod2pi(thetaB - a) - Math.PI * 2
    }
    let RSL: Path = [c1, s, c2]
    sections.push(RSL)
  }

  //RSL
  if ((Adir != Dir.Left) && (Bdir != Dir.Right) && world_dist(a_centers.r, b_centers.l) > Math.abs(radA + radB)) {
    let a = Math.asin((radA + radB) / world_dist(a_centers.r, b_centers.l)) + ar2bl
    let c1: Curve = {
      type: "Curve",
      center: a_centers.r,
      radius: radA,
      start: right_start,
      theta: mod2pi(a - thetaA)
    }
    let s: Straight = {
      type: "Straight",
      start: worldOffset(a_centers.r, radA, a - Math.PI / 2),
      end: worldOffset(b_centers.l, -radB, a - Math.PI / 2)
    }
    let c2: Curve = {
      type: "Curve",
      center: b_centers.l,
      radius: radB,
      start: a - 3 * (Math.PI / 2),
      theta: mod2pi(thetaB - a) - Math.PI * 2
    }
    let RSL: Path = [c1, s, c2]
    sections.push(RSL)

  }

  //LSR
  if ((Adir != Dir.Right) && (Bdir != Dir.Left) && world_dist(a_centers.l, b_centers.r) > Math.abs(radA + radB)) {
    let a = al2br - Math.asin((radA + radB) / world_dist(a_centers.l, b_centers.r))
    let c1: Curve = {
      type: "Curve",
      center: a_centers.l,
      radius: radA,
      start: left_start,
      theta: mod2pi(a - thetaA) - Math.PI * 2
    }
    let s: Straight = {
      type: "Straight",
      start: worldOffset(a_centers.l, radA, a + Math.PI / 2),
      end: worldOffset(b_centers.r, -radB, a + Math.PI / 2)
    }
    let c2: Curve = {
      type: "Curve",
      center: b_centers.r,
      radius: radB,
      start: a - Math.PI / 2,
      theta: mod2pi(thetaB - a)
    }
    let LSR: Path = [c1, s, c2]
    sections.push(LSR)
  }

  sections.sort((a, b) => worldPathLength(a) - worldPathLength(b))
  if (sections.length == 0) {
    console.log(Adir, Bdir)
  }
  console.assert(sections.length > 0);
  return sections[0]
}
