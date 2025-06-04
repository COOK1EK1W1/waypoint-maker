import { expect, test } from "bun:test";
import { interpolateAlt } from "../terrain";

const a = {
  lat: 0,
  lng: 0,
  alt: 0,
}

const b = {
  lat: 1,
  lng: 0,
  alt: 100,
}

const c = {
  lat: 0,
  lng: 1,
  alt: 200,
}

const d = {
  lat: 1,
  lng: 1,
  alt: 300,
}

test("Interpolate Altitudes", () => {

  expect(interpolateAlt(a, b, c, d, { lat: 0, lng: 0 })).toBe(0)
  expect(interpolateAlt(a, b, c, d, { lat: 1, lng: 0 })).toBe(100)
  expect(interpolateAlt(a, b, c, d, { lat: 0, lng: 1 })).toBe(200)
  expect(interpolateAlt(a, b, c, d, { lat: 1, lng: 1 })).toBe(300)

  expect(interpolateAlt(a, b, c, d, { lat: 0.00001, lng: 0.00001 })).toBeCloseTo(0, 1)
  expect(interpolateAlt(a, b, c, d, { lat: 0.99999, lng: 0.00001 })).toBeCloseTo(100, 1)
  expect(interpolateAlt(a, b, c, d, { lat: 0.00001, lng: 0.99999 })).toBeCloseTo(200, 1)
  expect(interpolateAlt(a, b, c, d, { lat: 0.99999, lng: 0.99999 })).toBeCloseTo(300, 1)
})
