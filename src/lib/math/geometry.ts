import { XY } from "./types"

/**
 * Converts degrees to radians
 * @param {number} deg - The angle in degrees
 * @returns {number} The angle in radians
 */
export function deg2rad(deg: number): number {
  return deg * Math.PI / 180
}

/**
 * Converts radians to degrees
 * @param {number} rad - The angle in radians
 * @returns {number} The angle in degrees
 */
export function rad2deg(rad: number): number {
  return rad * 180 / Math.PI
}

/**
 * Find the bearing between two points, north 0
 * @param {XY} a - origin point
 * @param {XY} b - ending point
 * @returns {number} The bearing in radians
 */
export function bearing(a: XY, b: XY): number {
  return (Math.atan2((b.x - a.x), (b.y - a.y)) + Math.PI * 2) % (Math.PI * 2)
}

/**
 * Correctly modulo a floating point number
 * @param {number} a
 * @param {number} divisor
 * @returns {number} a % divisor
 */
export function modf(a: number, divisor: number): number {
  return (divisor + (a % divisor)) % divisor
}

/**
 * mod a number by 2 * PI
 * @param {number} a
 * @returns {number} a % 2 * PI
 */
export function mod2pi(a: number): number {
  return modf(a, Math.PI * 2)

}
/**
 * Calculate the Euclidean distance between two points
 * @param {XY} a - First point
 * @param {XY} b - Second point
 * @returns {number} The Euclidean distance between points a and b
 */
export function dist(a: XY, b: XY): number {
  // euclidean distance function
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
}


/**
 * Calculate the offset of a point by a given distance and angle
 * @param {XY} a - The original point
 * @param {number} dist - The distance to offset the point
 * @param {number} angle - The angle to offset the point by
 * @returns {XY} The new point after offsetting
 */
export function offset(a: XY, dist: number, angle: number): XY {
  return {
    x: a.x + dist * Math.sin(angle),
    y: a.y + dist * Math.cos(angle)
  }
}
