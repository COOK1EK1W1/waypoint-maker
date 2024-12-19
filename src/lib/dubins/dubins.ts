import { XY, Path, Curve, Straight } from "@/types/dubins";
import { bearing, offset } from "./geometry";

export function DubinsBetween(a: XY, b: XY, theta_a: number, theta_b: number, turn_radius: number): Path{

  const a_R_CP: XY = offset(a, turn_radius, theta_a + Math.PI / 2)
  const a_L_CP: XY = offset(a, turn_radius, theta_a - Math.PI / 2)

  const b_R_CP: XY = offset(b, turn_radius, theta_b + Math.PI / 2)
  const b_L_CP: XY = offset(b, turn_radius, theta_b - Math.PI / 2)

  const ar2br = bearing(a_R_CP, b_R_CP)
  const al2bl = bearing(a_L_CP, b_L_CP)
  const ar2bl = bearing(a_R_CP, b_L_CP)
  const al2br = bearing(a_L_CP, b_R_CP)

  //RSR
  let AR: Curve = {type: "Curve", center: a_R_CP, radius: turn_radius, start: theta_a - Math.PI/2, theta:ar2br - theta_a}
  let ST: Straight = {type: "Straight", start: offset(a_R_CP, turn_radius, ar2br - Math.PI/2), end: offset(b_R_CP, turn_radius, ar2br - Math.PI/2)}
  let BR: Curve = {type: "Curve", center: b_R_CP, radius: turn_radius, start: (theta_a - Math.PI/2) + ar2br - theta_a, theta:(theta_b - ar2br + 2 * Math.PI) % (Math.PI * 2)}

  //return [AR, ST, BR]

  //LSL
  let AL: Curve = {type: "Curve", center: a_L_CP, radius: turn_radius, start: theta_a + Math.PI/2, theta: (al2bl - theta_a) - Math.PI * 2 }
  let ST2: Straight = {type: "Straight", start: offset(a_L_CP, turn_radius, al2bl + Math.PI/2), end: offset(b_L_CP, turn_radius, al2bl + Math.PI/2)}
  let BL: Curve = {type: "Curve", center: b_L_CP, radius: turn_radius, start: (theta_a + Math.PI/2) + ((al2bl - theta_a) - Math.PI * 2), theta:(theta_b - al2bl + 2 * Math.PI) % (Math.PI * 2) - Math.PI * 2}
  return [AL, ST2, BL, AR, ST, BR]

}
