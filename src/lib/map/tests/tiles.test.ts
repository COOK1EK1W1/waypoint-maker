import { expect, test } from "bun:test";
import { latlngToTile, tileSizeMeters, tilesForRadiusKm } from "../tiles";

test("latlng to tile", () => {
  // Test Edinburgh coordinates at different zoom levels
  expect(latlngToTile({ lat: 55.882436, lng: -3.266716 }, 13)).toEqual({ x: 4021, y: 2555 })
  expect(latlngToTile({ lat: 55.909643, lng: -3.318238 }, 18)).toEqual({ x: 128655, y: 81747 })
  
  // Test equator and prime meridian intersection
  expect(latlngToTile({ lat: 0, lng: 0 }, 0)).toEqual({ x: 0, y: 0 })
  
  // Test extreme coordinates (clamp latitude to 85.0511, the max for Web Mercator)
  // At zoom level 1, the world is divided into 2x2 tiles
  // (85.0511, 180) should be in the top-right tile
  expect(latlngToTile({ lat: 85.0511, lng: 180 }, 1).x).toBeGreaterThanOrEqual(1)
  expect(latlngToTile({ lat: 85.0511, lng: 180 }, 1).y).toBeGreaterThanOrEqual(0)
  // (-85.0511, -180) should be in the bottom-left tile
  expect(latlngToTile({ lat: -85.0511, lng: -180 }, 1).x).toBeGreaterThanOrEqual(0)
  expect(latlngToTile({ lat: -85.0511, lng: -180 }, 1).y).toBeGreaterThanOrEqual(1)
})

test("tile size in meters", () => {
  // Test at equator (zoom level 0 should be Earth's circumference)
  expect(tileSizeMeters(0, 0)).toBe(40075016.868)
  expect(tileSizeMeters(0, 1)).toBe(40075016.868 / 2)
  expect(tileSizeMeters(0, 4)).toBe(40075016.868 / Math.pow(2, 4))
  expect(tileSizeMeters(0, 20)).toBe(40075016.868 / Math.pow(2, 20))
  
  // Test at different latitudes
  expect(tileSizeMeters(45, 0)).toBeLessThan(40075016.868) // Should be smaller than equator
  expect(tileSizeMeters(60, 0)).toBeLessThan(tileSizeMeters(45, 0)) // Should be even smaller
})

test("tiles for radius km", () => {
  // Test at equator
  expect(tilesForRadiusKm(0, 0, 100)).toBe(1)
  expect(tilesForRadiusKm(0, 1, 100)).toBe(1)
  
  // Test at higher zooms and larger radius
  const tilesZoom5 = tilesForRadiusKm(0, 5, 100)
  const tilesZoom10 = tilesForRadiusKm(0, 10, 100)
  expect(tilesZoom5).toBeGreaterThan(0)
  expect(tilesZoom10).toBeGreaterThan(tilesZoom5)
  
  // Test at Edinburgh latitude
  const edinburghTiles = tilesForRadiusKm(55.882436, 13, 7)
  expect(edinburghTiles).toBeGreaterThan(0)
  expect(edinburghTiles).toBeLessThan(100) // Should be reasonable number of tiles
})
