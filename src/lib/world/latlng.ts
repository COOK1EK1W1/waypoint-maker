import { Command, LatLngAltCommand, LatLngCommand } from "@/lib/commands/commands";

export type LatLng = {
  lat: number,
  lng: number
}

export type LatLngAlt = {
  lat: number,
  lng: number,
  alt: number
}

/* get the latitude and longitude of a mission command
 */
export function getLatLng<T extends Command>(cmd: T): T extends LatLngCommand ? LatLng : (LatLng | undefined) {
  if ("latitude" in cmd.params && "longitude" in cmd.params) {
    return { lat: cmd.params.latitude, lng: cmd.params.longitude }
  }
  else return undefined as T extends LatLngCommand ? LatLng : (LatLng | undefined);
}

/* get the latitude, longitude and alitude of a mission command
 */
export function getLatLngAlt<T extends Command>(cmd: T): T extends LatLngAltCommand ? LatLngAlt : (LatLngAlt | undefined) {
  if ("latitude" in cmd.params && "longitude" in cmd.params && "altitude" in cmd.params) {
    return { lat: cmd.params.latitude, lng: cmd.params.longitude, alt: cmd.params.altitude }
  }
  else return undefined as T extends LatLngAltCommand ? LatLngAlt : (LatLngAlt | undefined);
}



// Terrain Altiotudes

// covret the command's altitude to amsl
export function getAltAMSL(cmd: Command, referenceAlt: number, terrainAlt: number): number | undefined {
  if ("altitude" in cmd.params) {
    switch (cmd.frame) {
      case 0: // MSL
        return cmd.params.altitude
      case 2: // non destination
        return undefined
      case 3: // relative to reference
        return cmd.params.altitude + referenceAlt
      case 10: //relative to terrain
        return cmd.params.altitude + terrainAlt
    }
  }
  else return undefined
}

// convert the command's altitude to relative to terrain
export function getAltTer(cmd: Command, referenceAlt: number, terrainAlt: number): number | undefined {
  if ("altitude" in cmd.params) {
    switch (cmd.frame) {
      case 0: // MSL
        return cmd.params.altitude - terrainAlt
      case 2: // non destination
        return undefined
      case 3: // relative to reference
        return cmd.params.altitude + referenceAlt - terrainAlt
      case 10: //relative to terrain
        return cmd.params.altitude
    }
  }
  else return undefined
}

// convert the command's altitude to relative to reference
export function getAltRel(cmd: Command, referenceAlt: number, terrainAlt: number): number | undefined {
  if ("altitude" in cmd.params) {
    switch (cmd.frame) {
      case 0: // MSL
        return cmd.params.altitude - referenceAlt
      case 2: // non destination
        return undefined
      case 3: // relative to reference
        return cmd.params.altitude
      case 10: //relative to terrain
        return cmd.params.altitude + terrainAlt - referenceAlt
    }
  }
  else return undefined
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
