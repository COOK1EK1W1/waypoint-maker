import { XY, Path, Curve, Straight } from "@/types/dubins";
import { mod2pi, world_dist, worldBearing, worldOffset, worldPathLength } from "./geometry";

function find_centers(a: XY, dir: number, dist: number): {l: XY, r: XY}{
  return {l: worldOffset(a, dist, dir - Math.PI / 2),
    r: worldOffset(a, dist, dir + Math.PI / 2)
  }
}

export function DubinsBetween(a: XY, b: XY, theta_a: number, theta_b: number, turn_radius: number): Path{
  return DubinsBetweenDiffRad(a, b, theta_a, theta_b, turn_radius, turn_radius)
}

export function DubinsBetweenDiffRad(a: XY, b: XY, theta_a: number, theta_b: number, radA: number, radB: number): Path{

  theta_a = mod2pi(theta_a)
  theta_b = mod2pi(theta_b)

  const a_centers = find_centers(a, theta_a, radA)
  const b_centers = find_centers(b, theta_b, radB)

  const ar2br = worldBearing(a_centers.r, b_centers.r)
  const al2bl = worldBearing(a_centers.l, b_centers.l)
  const ar2bl = worldBearing(a_centers.r, b_centers.l)
  const al2br = worldBearing(a_centers.l, b_centers.r)

  let sections: Path[] = []

  let left_start = theta_a + Math.PI/2
  let right_start = theta_a - Math.PI/2

  if (world_dist(a_centers.r, b_centers.r) > Math.abs(radA - radB)){
    //RSR
    let a = Math.asin((radA - radB) / world_dist(a_centers.r, b_centers.r)) + ar2br
    let c1: Curve = {type: "Curve", center: a_centers.r, radius: radA, start: right_start, theta: mod2pi(a - theta_a)}
    let s: Straight = {type: "Straight", start: worldOffset(a_centers.r, radA, a - Math.PI/2), end: worldOffset(b_centers.r, radB, a - Math.PI/2)}
    let c2: Curve = {type: "Curve", center: b_centers.r, radius: radB, start: a - Math.PI/2, theta: mod2pi(theta_b - a)}
    let RSL: Path = [c1, s, c2]
    sections.push(RSL)
  }

  if (world_dist(a_centers.l, b_centers.l) > Math.abs(radA - radB)){
    //LSL
    let a = al2bl - Math.asin((radA - radB) / world_dist(a_centers.l, b_centers.l))
    let c1: Curve = {type: "Curve", center: a_centers.l, radius: radA, start: left_start, theta: mod2pi(a - theta_a) - Math.PI*2}
    let s: Straight = {type: "Straight", start: worldOffset(a_centers.l, radA, a + Math.PI/2), end: worldOffset(b_centers.l, radB, a + Math.PI/2)}
    let c2: Curve = {type: "Curve", center: b_centers.l, radius: radB, start: a - 3 * (Math.PI/2), theta: mod2pi(theta_b - a) - Math.PI*2}
    let RSL: Path = [c1, s, c2]
    sections.push(RSL)
  }

  if (world_dist(a_centers.r, b_centers.l) > Math.abs(radA + radB)){
    //RSL
    let a = Math.asin((radA + radB) / world_dist(a_centers.r, b_centers.l)) + ar2bl
    let c1: Curve = {type: "Curve", center: a_centers.r, radius: radA, start: right_start, theta: mod2pi(a - theta_a)}
    let s: Straight = {type: "Straight", start: worldOffset(a_centers.r, radA, a - Math.PI/2), end: worldOffset(b_centers.l, -radB, a - Math.PI/2)}
    let c2: Curve = {type: "Curve", center: b_centers.l, radius: radB, start: a - 3 * (Math.PI/2), theta: mod2pi(theta_b - a) - Math.PI*2}
    let RSL: Path = [c1, s, c2]
    sections.push(RSL)

  }

  if (world_dist(a_centers.l, b_centers.r) > Math.abs(radA + radB)){
    //LSR
    let a = al2br - Math.asin((radA + radB) / world_dist(a_centers.l, b_centers.r))
    let c1: Curve = {type: "Curve", center: a_centers.l, radius: radA, start: left_start, theta: mod2pi(a - theta_a) - Math.PI*2}
    let s: Straight = {type: "Straight", start: worldOffset(a_centers.l, radA, a + Math.PI/2), end: worldOffset(b_centers.r, -radB, a + Math.PI/2)}
    let c2: Curve = {type: "Curve", center: b_centers.r, radius: radB, start: a - Math.PI/2, theta: mod2pi(theta_b - a)}
    let LSR: Path = [c1, s, c2]
    sections.push(LSR)
  }
  sections.sort((a, b)=> worldPathLength(a) - worldPathLength(b))
  return sections[0]
}
