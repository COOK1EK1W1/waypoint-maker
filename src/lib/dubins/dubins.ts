import { XY, Path, Curve, Straight } from "@/types/dubins";
import { bearing, offset } from "./geometry";

export function DubinsBetween(a: XY, b: XY, theta_a: number, theta_b: number, turn_radius: number): Path{

  const a_R_CP: XY = offset(a, turn_radius, theta_a + Math.PI / 2)
  const a_L_CP: XY = offset(a, turn_radius, theta_a - Math.PI / 2)

  const b_R_CP: XY = offset(b, turn_radius, theta_b + Math.PI / 2)
  const b_L_CP: XY = offset(b, turn_radius, theta_b - Math.PI / 2)

  const ar2br = bearing(a_R_CP, b_R_CP)

  //RSR
  let AR: Curve = {type: "Curve", center: a_R_CP, radius: turn_radius, start: theta_a - Math.PI/2, theta:ar2br - theta_a}
  let ST: Straight = {type: "Straight", start: offset(a_R_CP, turn_radius, ar2br - Math.PI/2), end: offset(b_R_CP, turn_radius, ar2br - Math.PI/2)}
  let BR: Curve = {type: "Curve", center: b_R_CP, radius: turn_radius, start: ar2br - theta_a, theta:theta_b - Math.PI/2}

  return []
}
