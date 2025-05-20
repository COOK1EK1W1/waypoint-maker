import { deg2rad } from "../math/geometry";
import { LatLng } from "../world/types";

/**
 * Converts a latitude/longitude coordinate to tile coordinates at a specific zoom level.
 * This is based on the standard Web Mercator projection used by most web mapping services.
 * 
 * @param pos - The latitude/longitude position to convert
 * @param zoom - The zoom level (0-20, where 0 is the entire world in one tile)
 * @returns Object containing x and y tile coordinates
 * 
 * @example
 * // Get tile coordinates for Edinburgh at zoom level 13
 * const tile = latlngToTile({ lat: 55.882436, lng: -3.266716 }, 13);
 * // Returns { x: 4021, y: 2555 }
 */
export function latlngToTile(pos: LatLng, zoom: number): { x: number, y: number } {
  const latRad = deg2rad(pos.lat)
  const n = Math.pow(2, zoom)
  const xTile = Math.floor(((pos.lng + 180) / 360) * n)
  const yTile = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
  return { x: xTile, y: yTile }
}

/**
 * Calculates the size of a tile in meters at a given latitude and zoom level.
 * The size varies with latitude due to the Mercator projection.
 * 
 * @param latDeg - The latitude in degrees
 * @param zoom - The zoom level (0-20)
 * @returns The size of the tile in meters
 * 
 * @example
 * // Get tile size at equator at zoom level 0
 * const size = tileSizeMeters(0, 0);
 * // Returns 40075016.868 (Earth's circumference)
 */
export function tileSizeMeters(latDeg: number, zoom: number) {
  const latRad = deg2rad(latDeg)
  return (40075016.868 * Math.cos(latRad)) / Math.pow(2, zoom)
}

/**
 * Calculates how many tiles are needed to cover a circular area of a given radius.
 * This is useful for determining the tile coverage needed for offline maps.
 * 
 * @param latDeg - The latitude in degrees of the center point
 * @param zoom - The zoom level (0-20)
 * @param radiusKm - The radius in kilometers
 * @returns The number of tiles needed to cover the area
 * 
 * @example
 * // Calculate tiles needed for a 7km radius at zoom level 13
 * const tiles = tilesForRadiusKm(55.882436, 13, 7);
 */
export function tilesForRadiusKm(latDeg: number, zoom: number, radiusKm: number) {
  const tileSize = tileSizeMeters(latDeg, zoom)
  return Math.floor((radiusKm * 1000) / tileSize) + 1
}
