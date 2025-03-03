import { dist } from "@/lib/math/geometry";
import { XY } from "../math/types";
import { Path, Segment } from "./types";

/**
 * Calculates the length of a segment in a Dubins path
 * @param {Segment<XY>} seg - The segment
 * @returns {number} The length of the segment
 */
export function segmentLength(seg: Segment<XY>): number {
  switch (seg.type) {
    case "Curve":
      return Math.abs(seg.theta * seg.radius)
    case "Straight":
      return dist(seg.start, seg.end)
  }
}

/**
 * Calculate the energy requirement for a curve segment
 * @param {number} radius - The radius of the curve
 * @param {number} velocity - The velocity of the vehicle
 * @returns {number} The energy requirement for the curve segment
 */
export function energyRequirement(radius: number, velocity: number): number {
  if (radius == 0) {
    return 0
  }
  return (Math.sqrt(radius * radius * 9.81 * 9.81 + Math.pow(velocity, 4))) / (radius * 9.81)
}

/**
 * Calculate the energy requirements for a path
 * @param {Path<XY>} path - The path to calculate the energy requirements for
 * @param {number} velocity - The velocity of the vehicle
 * @param {number} energyConstant - The energy constant to use
 * @returns {number} The total energy requirement for the path
 */
export function pathEnergyRequirements(path: Path<XY>, velocity: number, energyConstant: number = 1): number {
  let totalEnergy = 0
  for (const seg of path) {
    let segLength = segmentLength(seg)
    switch (seg.type) {
      case "Curve":
        totalEnergy += segLength * energyRequirement(seg.radius, velocity) * energyConstant
        continue;
      case "Straight":
        totalEnergy += segLength * energyConstant
        continue;
    }
  }
  return totalEnergy
}

/**
 * Calculate the length of a path
 * @param {Path<XY>} path - The path to calculate the length for
 * @returns {number} The length of the path
 */
export function pathLength(path: Path<XY>): number {
  return path.map((x: Segment<XY>) => segmentLength(x)).reduce((acc, a) => acc + a, 0)
}

