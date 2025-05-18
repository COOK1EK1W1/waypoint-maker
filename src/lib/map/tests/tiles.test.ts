import { expect, test } from "bun:test";
import { latlngToTile } from "../tiles";
test("latlng to tile", () => {
  expect(latlngToTile({ lat: 55.882436, lng: -3.266716 }, 13)).toEqual({ x: 4021, y: 2555 })
  expect(latlngToTile({ lat: 55.909643, lng: -3.318238 }, 18)).toEqual({ x: 128655, y: 81747 })
})
