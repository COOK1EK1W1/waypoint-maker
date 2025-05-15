import { Command, LatLngCommand } from "@/lib/commands/commands";

export type LatLng = {
  lat: number,
  lng: number
}

/* get the latitude and longitude of a mission command
 */
export function getLatLng<T extends Command>(cmd: T): T extends LatLngCommand ? LatLng : (LatLng | undefined) {
  if ("latitude" in cmd.params && "longitude" in cmd.params) {
    return { lat: cmd.params.latitude, lng: cmd.params.longitude }
  }
  else return undefined as T extends LatLngCommand ? LatLng : (LatLng | undefined);
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
