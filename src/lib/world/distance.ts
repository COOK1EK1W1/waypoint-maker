import { LatLng } from "@/types/dubins";
import { toRadians } from "@/util/distance";

/*
 * Calculate the distance between two points on a globe
 * @param {LatLng} pos1 the first position
 * @param {LatLng} pos2 the second position
 * @returns {number} distance in meters
 */
export function haversineDistance(pos1: LatLng, pos2: LatLng): number {
  const R = 6371000; // Earth's radius in meters

  const deltaLat = toRadians(pos2.lat - pos1.lat);
  const deltaLng = toRadians(pos2.lng - pos1.lng);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(pos1.lat)) * Math.cos(toRadians(pos2.lat)) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}
