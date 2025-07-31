import { haversineDistance } from "@/lib/world/distance";
import { LatLng, LatLngAlt } from "@/lib/world/latlng";
import { createStore, get, getMany, set, setMany } from "idb-keyval";
import { Command } from "@/lib/commands/commands";

const TERRAIN_RES = 2
const offset = 1 / 10 ** TERRAIN_RES

const terStore = createStore('terStore', 'terStore')

/**
 * Gets the four surrounding grid points for bilinear interpolation
 * @param loc The target location
 * @returns Array of four corner points forming a square around the target location
 */
function getSurroundingPoints(loc: LatLng): LatLng[] {
  return [
    { lat: Number(loc.lat.toFixed(TERRAIN_RES)), lng: Number(loc.lng.toFixed(TERRAIN_RES)) },
    { lat: Number(loc.lat.toFixed(TERRAIN_RES)), lng: Number((loc.lng + offset).toFixed(TERRAIN_RES)) },
    { lat: Number((loc.lat + offset).toFixed(TERRAIN_RES)), lng: Number(loc.lng.toFixed(TERRAIN_RES)) },
    { lat: Number((loc.lat + offset).toFixed(TERRAIN_RES)), lng: Number((loc.lng + offset).toFixed(TERRAIN_RES)) }
  ]
}

/**
 * Converts a LatLng location to a cache key string
 * @param loc The location to convert
 * @returns String key for caching terrain data
 */
function toKey(loc: LatLng): string {
  return `${loc.lat.toFixed(TERRAIN_RES)},${loc.lng.toFixed(TERRAIN_RES)}`;
}

/**
 * Retrieves terrain elevation data for given locations using caching and API fallback
 * @param locs Array of locations to get elevation data for
 * @returns Promise resolving to array of elevation data or null if failed
 */
export async function getTerrain(locs: LatLng[]): Promise<LatLngAlt[] | null> {
  if (locs.length === 0) return [];
  
  const extrapolatedLocs = new Set<string>();
  locs.map((x) => {
    getSurroundingPoints(x).map((y) => extrapolatedLocs.add(toKey(y)))
  })

  const keys = Array.from(extrapolatedLocs).map(key => {
    const [a, b] = key.split(',').map(Number)
    return { lat: a, lng: b }
  });

  const { locs: found, nf } = await getTerrainFromStorage(keys)
  console.log(`[TER] using ${found.length} cached, querying ${nf.length}`)

  let elevation: LatLngAlt[] = []

  // If we have missing locations, fetch them from API
  if (nf.length > 0) {
    const apiResults = await fetchTerrain(nf)
    if (apiResults === null) {
      console.log("Failed to fetch terrain data from API")
      return null
    }
    elevation = apiResults

    // Save new elevations to cache
    await setMany(apiResults.map((x) => ([`${x.lat},${x.lng}`, x.alt])), terStore)
  }

  // Combine cached and API results
  elevation = [...elevation, ...found]

  // Interpolate elevations for original locations
  let interpolatedElevations: LatLngAlt[] = []
  for (const loc of locs) {
    let a = elevation.find((val) => val.lat == Number(loc.lat.toFixed(TERRAIN_RES)) && val.lng == Number(loc.lng.toFixed(TERRAIN_RES)))
    let b = elevation.find((val) => val.lat == Number(loc.lat.toFixed(TERRAIN_RES)) && val.lng == Number((loc.lng + offset).toFixed(TERRAIN_RES)))
    let c = elevation.find((val) => val.lat == Number((loc.lat + offset).toFixed(TERRAIN_RES)) && val.lng == Number(loc.lng.toFixed(TERRAIN_RES)))
    let d = elevation.find((val) => val.lat == Number((loc.lat + offset).toFixed(TERRAIN_RES)) && val.lng == Number((loc.lng + offset).toFixed(TERRAIN_RES)))

    if (a === undefined || b === undefined || c === undefined || d === undefined) {
      console.log("Missing surrounding points for interpolation")
      continue
    }

    interpolatedElevations.push({ ...loc, alt: Number(interpolateAlt(a, b, c, d, loc).toFixed()) })
  }

  return new Promise((resolve) => resolve(interpolatedElevations))
}

/**
 * Retrieves terrain data from local IndexedDB cache
 * @param locs Array of locations to look up in cache
 * @returns Promise resolving to object containing found elevations and not-found locations
 */
export async function getTerrainFromStorage(locs: LatLng[]): Promise<{ locs: LatLngAlt[], nf: LatLng[] }> {
  if (locs.length === 0) return { locs: [], nf: [] };
  
  const keys = locs.map((loc) => `${loc.lat},${loc.lng}`)
  const res = await getMany(keys, terStore)

  const elev: LatLngAlt[] = []
  const nf: LatLng[] = []

  for (let i = 0; i < res.length; i++) {
    if (res[i] === undefined) {
      nf.push(locs[i])
    } else {
      elev.push({ ...locs[i], alt: res[i] })
    }
  }

  return new Promise((resolve) => resolve({ locs: elev, nf }))
}

/**
 * Fetches terrain elevation data from external API
 * @param locs Array of locations to fetch elevation data for
 * @returns Promise resolving to elevation data array or null if failed
 */
export async function fetchTerrain(locs: LatLng[]): Promise<LatLngAlt[] | null> {
  if (locs.length == 0) return Promise.resolve(null)
  let locstring = locs.map((loc) => `${loc.lat.toFixed(7)},${loc.lng.toFixed(7)}`).join("|")

  return fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${locstring}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data.results) {
        throw new Error("No results found in the response");
      }
      return data.results.map((x: { elevation: number, latitude: number, longitude: number }) => ({
        alt: x.elevation,
        lat: x.latitude,
        lng: x.longitude,
      } as LatLngAlt))
    })
    .catch((error) => {
      console.log("Error fetching elevation data:", error);
      return null;
    });

}

/**
 * Performs bilinear interpolation of altitude using four corner points
 * Uses inverse distance weighting when target point matches a corner exactly
 * @param a Bottom-left corner point
 * @param b Bottom-right corner point  
 * @param c Top-left corner point
 * @param d Top-right corner point
 * @param target Target location to interpolate altitude for
 * @returns Interpolated altitude value
 */
export function interpolateAlt(a: LatLngAlt, b: LatLngAlt, c: LatLngAlt, d: LatLngAlt, target: LatLng): number {
  const distA = haversineDistance(target, a);
  if (distA == 0) return a.alt
  const distB = haversineDistance(target, b);
  if (distB == 0) return b.alt
  const distC = haversineDistance(target, c);
  if (distC == 0) return c.alt
  const distD = haversineDistance(target, d);
  if (distD == 0) return d.alt
  return (a.alt / distA + b.alt / distB + c.alt / distC + d.alt / distD) / (1 / distA + 1 / distB + 1 / distC + 1 / distD)
}

/**
 * Interpolates between two LatLng points by a given fraction
 * @param a First point
 * @param b Second point  
 * @param fraction Interpolation fraction (0-1)
 * @returns Interpolated point
 */
export function interpolateLatLng(a: LatLng, b: LatLng, fraction: number): LatLng {
  return { 
    lat: a.lat * (1 - fraction) + b.lat * fraction, 
    lng: a.lng * (1 - fraction) + b.lng * fraction 
  };
}

/**
 * Finds the closest terrain point to a given location
 * @param terrainData Array of terrain elevation points
 * @param point Target location
 * @returns Elevation at the closest terrain point
 */
export function getTerrainElevationAtPoint(terrainData: LatLngAlt[], point: LatLng): number {
  if (!terrainData.length) return 0;

  let closestPoint = terrainData[0];
  let minDistance = haversineDistance(point, terrainData[0]);

  for (const terrainPoint of terrainData) {
    const distance = haversineDistance(point, terrainPoint);
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = terrainPoint;
    }
  }

  return closestPoint.alt;
}

/**
 * Calculates cumulative distances between waypoints
 * @param waypoints Array of waypoints with lat/lng
 * @returns Array of cumulative distances
 */
export function calculateCumulativeDistances(waypoints: LatLng[]): number[] {
  const distances: number[] = [0];
  let totalDistance = 0;
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const segmentDistance = haversineDistance(waypoints[i], waypoints[i + 1]);
    totalDistance += segmentDistance;
    distances.push(totalDistance);
  }
  
  return distances;
}

/**
 * Generates interpolated points along a path between waypoints
 * @param waypoints Array of waypoints
 * @param totalDistance Total distance of the path
 * @param numInterpolationPoints Number of points to interpolate
 * @returns Array of interpolated locations
 */
export function generateInterpolatedPath(waypoints: LatLng[], totalDistance: number, numInterpolationPoints: number = 100): LatLng[] {
  if (waypoints.length === 0) return [];
  
  const locations: LatLng[] = [waypoints[0]];
  const interpolatedStepSize = totalDistance > 0 ? totalDistance / numInterpolationPoints : 0;

  if (interpolatedStepSize > 0) {
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const segmentDistance = haversineDistance(p1, p2);

      if (segmentDistance > 0) {
        const numInterpolationIntervals = Math.floor(segmentDistance / interpolatedStepSize);
        for (let j = 1; j < numInterpolationIntervals; j++) {
          const fraction = j / numInterpolationIntervals;
          locations.push(interpolateLatLng(p1, p2, fraction));
        }
      }
      
      // Add p2 if it's not already the same as the last point
      const lastPoint = locations[locations.length - 1];
      if (lastPoint.lat !== p2.lat || lastPoint.lng !== p2.lng) {
        locations.push(p2);
      }
    }
  } else {
    // Add all unique waypoints if no valid step size
    for (let i = 1; i < waypoints.length; i++) {
      const nextLoc = waypoints[i];
      const lastPoint = locations[locations.length - 1];
      if (lastPoint.lat !== nextLoc.lat || lastPoint.lng !== nextLoc.lng) {
        locations.push(nextLoc);
      }
    }
  }

  return locations;
}

/**
 * Adjusts altitude based on reference frame
 * @param altitude Original altitude
 * @param frame Reference frame (0=AMSL, 3=Relative, 10=Terrain)
 * @param terrainElevation Terrain elevation at the point
 * @param baseTerrainElevation Base terrain elevation for relative calculations
 * @returns Adjusted altitude for display
 */
export function adjustAltitudeForDisplay(
  altitude: number, 
  frame: number, 
  terrainElevation: number, 
  baseTerrainElevation: number
): number {
  switch (frame) {
    case 0: // AMSL (adjust to relative for graph)
      return altitude - baseTerrainElevation;
    case 3: // Relative to first command
      return altitude;
    case 10: // Relative to terrain
      return altitude + terrainElevation - baseTerrainElevation;
    default:
      return altitude;
  }
}

/**
 * Performs linear interpolation of altitudes between waypoints
 * @param waypoints Array of waypoints with altitude and position data
 * @param startAltitude Starting altitude
 * @param endAltitude Ending altitude
 * @returns Array of interpolated altitudes
 */
export function interpolateAltitudes(
  waypoints: Array<{ lat: number; lng: number; altitude: number }>,
  startAltitude: number,
  endAltitude: number
): number[] {
  if (waypoints.length < 2) return [];

  const distances = calculateCumulativeDistances(waypoints);
  const totalDistance = distances[distances.length - 1];
  
  if (totalDistance === 0) return waypoints.map(() => startAltitude);

  return distances.map(distance => 
    startAltitude + (endAltitude - startAltitude) * (distance / totalDistance)
  );
}

/**
 * Calculates interpolated altitudes for waypoints between start and end points
 * @param waypoints Array of waypoints with lat/lng/alt parameters
 * @param startIndex Index of the starting waypoint
 * @param endIndex Index of the ending waypoint
 * @returns Object containing interpolated altitudes and total distance
 */
export function calculateInterpolatedAltitudes(
  waypoints: Array<{ params: { latitude: number; longitude: number; altitude: number } }>,
  startIndex: number,
  endIndex: number
): { interpolatedAltitudes: number[]; totalDistance: number } {
  if (startIndex >= endIndex || startIndex < 0 || endIndex >= waypoints.length) {
    return { interpolatedAltitudes: [], totalDistance: 0 };
  }

  const startAlt = waypoints[startIndex].params.altitude;
  const endAlt = waypoints[endIndex].params.altitude;
  
  // Calculate total distance between waypoints
  let totalDistance = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const wp1 = waypoints[i];
    const wp2 = waypoints[i + 1];
    totalDistance += haversineDistance(
      { lat: wp1.params.latitude, lng: wp1.params.longitude },
      { lat: wp2.params.latitude, lng: wp2.params.longitude }
    );
  }

  // Calculate interpolated altitudes
  const interpolatedAltitudes: number[] = [];
  let cumulativeDistance = 0;
  
  for (let i = startIndex + 1; i < endIndex; i++) {
    const prevWp = waypoints[i - 1];
    const currentWp = waypoints[i];
    
    cumulativeDistance += haversineDistance(
      { lat: prevWp.params.latitude, lng: prevWp.params.longitude },
      { lat: currentWp.params.latitude, lng: currentWp.params.longitude }
    );
    
    const fraction = totalDistance > 0 ? cumulativeDistance / totalDistance : 0;
    const interpolatedAlt = startAlt + (endAlt - startAlt) * fraction;
    interpolatedAltitudes.push(interpolatedAlt);
  }

  return { interpolatedAltitudes, totalDistance };
}

