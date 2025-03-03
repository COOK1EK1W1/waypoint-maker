import { XY } from "@/lib/math/types";
import { LatLng } from "./types";

const worldRadius = 6371000 // meters

/**
 * Convert WGS84 to local ENU using a given reference point
 * @param {LatLng} reference - The reference point in WGS84 coordinates (latitude/longitude)
 * @param {LatLng} point - The point in WGS84 coordinates (latitude/longitude)
 * @returns {XY} The converted local ENU coordinates
 */
export function g2l(reference: LatLng, point: LatLng): XY {
  const { lat: refLat, lng: refLng } = reference;
  const { lat, lng } = point;

  // Convert latitude and longitude differences to radians
  const dLat = (lat - refLat) * (Math.PI / 180);
  const dLng = (lng - refLng) * (Math.PI / 180);

  // Calculate north and east distances
  const north = dLat * worldRadius;
  const east = dLng * worldRadius * Math.cos(refLat * (Math.PI / 180));

  return { y: north, x: east };
}

/**
 * Convert local ENU to WGS84 using a given reference point
 * @param {LatLng} reference - The reference point in WGS84 coordinates (latitude/longitude)
 * @param {XY} point - The point in local ENU coordinates (x=east, y=north in meters)
 * @returns {LatLng} The converted WGS84 coordinates
 */
export function l2g(reference: LatLng, point: XY): LatLng {
  const { lat: refLat, lng: refLng } = reference;
  const { x: east, y: north } = point;

  // Convert north and east distances to latitude and longitude differences
  const dLat = north / worldRadius;
  const dLng = east / (worldRadius * Math.cos(refLat * (Math.PI / 180)));

  // Convert differences to degrees
  const lat = refLat + dLat * (180 / Math.PI);
  const lng = refLng + dLng * (180 / Math.PI);

  return { lat, lng };
}
