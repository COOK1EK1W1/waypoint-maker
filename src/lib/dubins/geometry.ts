import { dist } from "@/lib/math/geometry";
import { XY } from "../math/types";
import { Segment } from "./types";

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
 * Calculate the load factor for a curve segment
 * @param {number} radius - The radius of the curve
 * @param {number} velocity - The velocity of the vehicle
 * @returns {number} The load factor for the curve segment
 */
export function loadFactor(radius: number, velocity: number): number {
  if (radius == 0) {
    return 0
  }
  //return (Math.sqrt(radius * radius * 9.81 * 9.81 + Math.pow(velocity, 4))) / (radius * 9.81)
  return Math.sqrt(1 + (Math.pow(velocity, 4) / (radius * radius * 9.81 * 9.81)))
}
