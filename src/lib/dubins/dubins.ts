import { XY, Path, Curve, Straight } from "@/types/dubins";
import { bearing, dist, offset, pathLength, world_dist } from "./geometry";

function find_centers(a: XY, dir: number, dist: number): {l: XY, r: XY}{
  return {l: offset(a, dist, dir - Math.PI / 2),
    r: offset(a, dist, dir + Math.PI / 2)
  }
}

export function DubinsBetween(a: XY, b: XY, theta_a: number, theta_b: number, turn_radius: number): Path{
  const a_centers = find_centers(a, theta_a, turn_radius)
  theta_a = theta_a % 360
  theta_b = theta_b % 360

  const b_R_CP: XY = offset(b, turn_radius, theta_b + Math.PI / 2)
  const b_L_CP: XY = offset(b, turn_radius, theta_b - Math.PI / 2)

  const ar2br = bearing(a_centers.r, b_R_CP)
  const al2bl = bearing(a_centers.l, b_L_CP)
  const ar2bl = bearing(a_centers.r, b_L_CP)
  const al2br = bearing(a_centers.l, b_R_CP)
  let sections: Path[] = []

  //RSR
  let AR: Curve = {type: "Curve", center: a_centers.r, radius: turn_radius, start: theta_a - Math.PI/2, theta:(ar2br - theta_a + Math.PI * 2) % (Math.PI * 2)}
  let ST: Straight = {type: "Straight", start: offset(a_centers.r, turn_radius, ar2br - Math.PI/2), end: offset(b_R_CP, turn_radius, ar2br - Math.PI/2)}
  let BR: Curve = {type: "Curve", center: b_R_CP, radius: turn_radius, start: (theta_a - Math.PI/2) + ar2br - theta_a, theta:(theta_b - ar2br + 2 * Math.PI) % (Math.PI * 2)}
  let RSR: Path = [AR, ST, BR]
  sections.push(RSR)

  //LSL
  let AL: Curve = {type: "Curve", center: a_centers.l, radius: turn_radius, start: theta_a + Math.PI/2, theta: (al2bl - theta_a + Math.PI * 2) % (Math.PI * 2) - Math.PI * 2 }
  let ST2: Straight = {type: "Straight", start: offset(a_centers.l, turn_radius, al2bl + Math.PI/2), end: offset(b_L_CP, turn_radius, al2bl + Math.PI/2)}
  let BL: Curve = {type: "Curve", center: b_L_CP, radius: turn_radius, start: (theta_a + Math.PI/2) + ((al2bl - theta_a) - Math.PI * 2), theta:(theta_b - al2bl + 2 * Math.PI) % (Math.PI * 2) - Math.PI * 2}
  let LSL: Path = [AL, ST2, BL]
  sections.push(LSL)
  
  //RSL
  if (world_dist(a_centers.r, b_L_CP) > turn_radius * 2){
    let a = Math.asin((turn_radius * 2) / world_dist(a_centers.r, b_L_CP)) + ar2bl
    let AR2: Curve = {type: "Curve", center: a_centers.r, radius: turn_radius, start: theta_a - Math.PI/2, theta: (a - theta_a + Math.PI * 2) % (Math.PI * 2)}
    let ST3: Straight = {type: "Straight", start: offset(a_centers.r, turn_radius, a - Math.PI/2), end: offset(b_L_CP, turn_radius, a + Math.PI/2)}
    let BL2: Curve = {type: "Curve", center: b_L_CP, radius: turn_radius, start: (theta_a + Math.PI/2) + ((a - theta_a) - Math.PI * 2), theta:(theta_b - a + 2 * Math.PI) % (Math.PI * 2) - Math.PI * 2}
    let RSL: Path = [AR2, ST3, BL2]
    sections.push(RSL)
  }
  //LSR
  if (world_dist(a_centers.l, b_R_CP) > turn_radius * 2){
    let a = Math.asin((turn_radius * 2) / world_dist(a_centers.l, b_R_CP))
    let AR2: Curve = {type: "Curve", center: a_centers.l, radius: turn_radius, start: theta_a + Math.PI/2, theta:Math.PI * 2 - (al2br - a)}
    let ST3: Straight = {type: "Straight", start: offset(a_centers.l, turn_radius, a - Math.PI), end: offset(b_R_CP, turn_radius, Math.PI/2 - a)}
    let BL2: Curve = {type: "Curve", center: b_R_CP, radius: turn_radius, start: Math.PI/2 - a, theta:(theta_b - a + 2 * Math.PI)}
    let LSR: Path = [AR2, ST3, BL2]
    return LSR
    sections.push(LSR)
  }

  sections.sort((a, b)=> pathLength(a) - pathLength(b))
  return sections[0]

}
