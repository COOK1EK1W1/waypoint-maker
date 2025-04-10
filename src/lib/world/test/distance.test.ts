import { expect, test } from "bun:test";
import { haversineDistance, worldBearing } from "@/lib/world/distance";
import { avgLatLng } from "../latlng";

test("world distance better func", () => {
  expect(haversineDistance({ lng: 0, lat: 0 }, { lng: 0, lat: 0 })).toBeCloseTo(0)
  expect(haversineDistance({ lng: 0, lat: 0 }, { lng: 20, lat: 20 })).toBeCloseTo(3112445.04)
  expect(haversineDistance({ lng: 20, lat: 20 }, { lng: 0, lat: 0 })).toBeCloseTo(3112445.04)
  expect(haversineDistance({ lng: 0, lat: 0 }, { lng: 90, lat: 0 })).toBeCloseTo(10007543.4)
  expect(haversineDistance({ lng: 0, lat: 0 }, { lng: 90, lat: 40 })).toBeCloseTo(10007543.4)
  expect(haversineDistance({ lat: 40.7128, lng: 74.006 }, { lat: 51.5072, lng: 0.1276 })).toBeCloseTo(5570242.31)
  expect(haversineDistance({ lat: -30, lng: 12 }, { lat: 30, lng: 127 })).toBeCloseTo(13848000, -3)
})

test("world Bearing", () => {
  expect(worldBearing({ lng: 0, lat: 0 }, { lng: 0, lat: 10 })).toBe(0)
  expect(worldBearing({ lng: 0, lat: 0 }, { lng: 0, lat: -10 })).toBeCloseTo(Math.PI)
})

test("Average LatLng", () => {
  expect(avgLatLng([{ lat: 0, lng: 0 }])).toEqual({ lat: 0, lng: 0 })

  expect(avgLatLng([])).toBeUndefined()

  expect(avgLatLng([{ lat: 10, lng: 10 }, { lat: -10, lng: 10 }, { lat: -10, lng: -10 }, { lat: 10, lng: -10 }])).toEqual({ lat: 0, lng: 0 })
})
