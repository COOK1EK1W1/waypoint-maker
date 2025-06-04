import { haversineDistance } from "@/lib/world/distance";
import { LatLng, LatLngAlt } from "@/lib/world/latlng";
import { createStore, get, getMany, set, setMany } from "idb-keyval";

const TERRAIN_RES = 2
const offset = 1 / 10 ** TERRAIN_RES

const terStore = createStore('terStore', 'terStore')

function getSurroundingPoints(loc: LatLng): LatLng[] {
  return [
    { lat: Number(loc.lat.toFixed(TERRAIN_RES)), lng: Number(loc.lng.toFixed(TERRAIN_RES)) },
    { lat: Number(loc.lat.toFixed(TERRAIN_RES)), lng: Number((loc.lng + offset).toFixed(TERRAIN_RES)) },
    { lat: Number((loc.lat + offset).toFixed(TERRAIN_RES)), lng: Number(loc.lng.toFixed(TERRAIN_RES)) },
    { lat: Number((loc.lat + offset).toFixed(TERRAIN_RES)), lng: Number((loc.lng + offset).toFixed(TERRAIN_RES)) }
  ]
}

function toKey(loc: LatLng): string {
  return `${loc.lat.toFixed(TERRAIN_RES)},${loc.lng.toFixed(TERRAIN_RES)} `
}



/* get the terrain elevations for data
 * @param {LatLng[]} locs - the locations at which to get the elevation
 * @retun {Promise<LatLngAlt[] | null>} - The elevations in AMSL
*/
export async function getTerrain(locs: LatLng[]): Promise<LatLngAlt[] | null> {
  const extrapolatedLocs = new Set<string>();
  locs.map((x) => {
    getSurroundingPoints(x).map((y) => extrapolatedLocs.add(toKey(y)))
  })

  const keys = Array.from(extrapolatedLocs).map(key => {
    const [a, b] = key.split(',').map(Number)
    return { lat: a, lng: b }
  });

  const { locs: found, nf } = await getTerrainFromStorage(keys)
  console.log(`[TER] using ${found.length} cahced, querying ${nf.length}`)

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

export async function getTerrainFromStorage(locs: LatLng[]): Promise<{ locs: LatLngAlt[], nf: LatLng[] }> {
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

