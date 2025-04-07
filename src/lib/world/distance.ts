import { deg2rad, mod2pi } from "@/lib/math/geometry";
import { angleBetweenVectors } from "@/lib/math/vector";
import { LatLng } from "./types";

/*
 * Calculate the distance between two points on a globe
 * @param {LatLng} pos1 the first position
 * @param {LatLng} pos2 the second position
 * @returns {number} distance in meters
 */
export function haversineDistance(pos1: LatLng, pos2: LatLng): number {
  const R = 6371000; // Earth's radius in meters

  const deltaLat = deg2rad(pos2.lat - pos1.lat);
  const deltaLng = deg2rad(pos2.lng - pos1.lng);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(deg2rad(pos1.lat)) * Math.cos(deg2rad(pos2.lat)) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * Calculate the angle between three global coordinates
 * @param {LatLng} pos1 - The first point
 * @param {LatLng} pos2 - The second point
 * @param {LatLng} pos3 - The third point
 * @returns {number} The angle between the three points in degrees
 */
export function angleBetweenPoints(pos1: LatLng, pos2: LatLng, pos3: LatLng): number {
  const v1 = latLngToVector(pos1);
  const v2 = latLngToVector(pos2);
  const v3 = latLngToVector(pos3);

  const vectorA: [number, number, number] = [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
  const vectorB: [number, number, number] = [v3[0] - v2[0], v3[1] - v2[1], v3[2] - v2[2]];

  const angleRad = angleBetweenVectors(vectorA, vectorB);

  return angleRad * (180 / Math.PI);
}

/**
 * Convert a latitude/longitude coordinate to a 3D Cartesian vector
 * @param {LatLng} pos - The latitude/longitude coordinate to convert
 * @returns {[number, number, number]} A tuple containing the x, y, z coordinates of the vector
 */
export function latLngToVector(pos: LatLng): [number, number, number] {
  const latRad = deg2rad(pos.lat);
  const lngRad = deg2rad(pos.lng);

  const x = Math.cos(latRad) * Math.cos(lngRad);
  const y = Math.cos(latRad) * Math.sin(lngRad);
  const z = Math.sin(latRad);

  return [x, y, z];
}

/**
 * Calculate the gradient between two altitudes
 * @param {number} distance - The distance between the two points
 * @param {number} alt1 - The first altitude
 * @param {number} alt2 - The second altitude
 * @returns {number} The gradient in degrees
 */
export function gradient(distance: number, alt1: number, alt2: number) {
  const altitudeChange = alt2 - alt1;
  const gradientRadians = Math.atan(altitudeChange / distance);
  const gradientDegrees = gradientRadians * (180 / Math.PI);
  return Number(gradientDegrees.toPrecision(3));
}

/**
 * Format a distance in meters to a human-readable string
 * @param {number} distanceInMeters - The distance in meters
 * @returns {string} The formatted distance
 */
export function formatDistance(distanceInMeters: number) {
  // If the distance is less than 1 kilometer, return in meters rounded to three significant figures
  if (distanceInMeters < 1000) {
    const roundedMeters = Number(distanceInMeters.toPrecision(3));
    return `${roundedMeters} meters`;
  } else {
    // Otherwise, convert to kilometers and round to three significant figures
    let distanceInKilometers = distanceInMeters / 1000;
    const roundedKilometers = Number(distanceInKilometers.toPrecision(3));
    return `${roundedKilometers} kilometers`;
  }
}

export function worldBearing(a: LatLng, b: LatLng): number {
  const lat1 = deg2rad(a.lat)
  const lat2 = deg2rad(b.lat)
  const lon1 = deg2rad(a.lng)
  const lon2 = deg2rad(b.lng)

  const deltaLon = lon2 - lon1

  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

  const initialBearing = Math.atan2(y, x); // Bearing in radians
  const normalizedBearing = mod2pi(initialBearing); // Convert to degrees and normalize

  return normalizedBearing;
}

export function worldOffset(a: LatLng, dist: number, angle: number): LatLng {
  const latRad = deg2rad(a.lat)
  const mpld = 111320.0;
  const mplo = 111320.0 * Math.cos(latRad);
  return {
    lng: a.lng + dist * Math.sin(angle) / mplo,
    lat: a.lat + dist * Math.cos(angle) / mpld
  }
}

/*
 * find the average latitude and longitude of an array of locations
 * @param locs - Array of locations as LatLng
 * returns a new LatLng
 */
export const avgLatLng = (locs: LatLng[]): LatLng | undefined => {
  if (locs.length == 0) return undefined
  let totLat = 0;
  let totLng = 0;
  locs.forEach((loc) => {
    totLat += loc.lat;
    totLng += loc.lng;
  })
  return { lat: totLat / locs.length, lng: totLng / locs.length }
}
