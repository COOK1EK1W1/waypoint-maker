import { deg2rad } from "../math/geometry";
import { LatLng } from "../world/types";

export function latlngToTile(pos: LatLng, zoom: number): { x: number, y: number } {
  const latRad = deg2rad(pos.lat)
  const n = Math.pow(2, zoom)
  const xTile = Math.floor(((pos.lng + 180) / 360) * n)
  const yTile = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n)
  return { x: xTile, y: yTile }
}

export function tileSizeMeters(latDeg: number, zoom: number) {
  const latRad = deg2rad(latDeg)
  return (40075016.868 * Math.cos(latRad)) / Math.pow(2, zoom)
}

export function tilesForRadiusKm(latDeg: number, zoom: number, radiusKm: number) {
  const tileSize = tileSizeMeters(latDeg, zoom)
  return Math.floor((radiusKm * 1000) / tileSize) + 1
}
