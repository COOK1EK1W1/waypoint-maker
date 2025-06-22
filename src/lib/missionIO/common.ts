import { dubinsBetweenDubins, localiseDubinsPath, localisePath, splitDubinsRuns, waypointToDubins } from "@/lib/dubins/dubinWaypoints";
import { LatLng } from "../world/latlng";
import { Command, MavCommand } from "../commands/commands";
import { WPM2MAV } from "../commands/convert";
import { importqgcWaypoints } from "./qgcWaypoints/spec";
import { importwpm2, isValidMission } from "./wm2/spec";
import { importwpm1 } from "./wm1/spec";
import { convertToMainLine, Mission } from "@/lib/mission/mission";
import { Vehicle } from "../vehicles/types";
import { makeCommand } from "../commands/default";
import { Result } from "@/util/try-catch";
import { haversineDistance, worldOffset } from "../world/distance";

/**
 * Checks if two waypoints are at the same location
 * @param wp1 First waypoint with latitude/longitude parameters
 * @param wp2 Second waypoint with latitude/longitude parameters
 * @returns True if waypoints are at the same location
 */
function areWaypointsAtSameLocation(wp1: Command, wp2: Command): boolean {
  return 'longitude' in wp1.params && 'latitude' in wp1.params &&
         'longitude' in wp2.params && 'latitude' in wp2.params &&
         wp1.params.longitude === wp2.params.longitude && 
         wp1.params.latitude === wp2.params.latitude;
}

/**
 * Checks if two loiter turn commands can be combined
 * @param cur Current loiter turn command
 * @param next Next loiter turn command
 * @returns True if the commands can be combined
 */
function canCombineLoiterTurns(cur: Command, next: Command): boolean {
  return cur.type === 18 && next.type === 18 && 
         'radius' in cur.params && 'radius' in next.params &&
         'altitude' in cur.params && 'altitude' in next.params &&
         'turns' in cur.params && 'turns' in next.params &&
         areWaypointsAtSameLocation(cur, next) &&
         cur.params.radius === next.params.radius &&
         cur.params.altitude === next.params.altitude;
}

/**
 * Calculates interpolated altitude along a Dubins path segment
 * @param startAlt Starting altitude
 * @param endAlt Ending altitude
 * @param segmentDistance Distance of current segment
 * @param totalDistance Total distance of the path
 * @returns Interpolated altitude for the segment
 */
function calculateInterpolatedAltitude(
  startAlt: number, 
  endAlt: number, 
  segmentDistance: number, 
  totalDistance: number
): number {
  if (totalDistance === 0) return startAlt;
  return startAlt + (segmentDistance / totalDistance) * (endAlt - startAlt);
}

/**
 * Simplifies consecutive Dubins waypoints by combining similar commands and removing insignificant turns
 * @param wps Array of waypoint commands to simplify
 * @returns Simplified array of waypoint commands
 */
export function simplifyDubinsWaypoints(wps: Command[]): Command[] {
  if (wps.length === 0) return [];

  const simplifiedMavWP: Command[] = []
  for (let i = 0; i < wps.length; i++) {
    const cur = wps[i]
    const next = wps[i + 1]

    if (next === undefined) {
      simplifiedMavWP.push(wps[i])
      break
    }

    // Combine consecutive loiter turns at the same location
    if (canCombineLoiterTurns(cur, next)) {
      simplifiedMavWP.push(makeCommand("MAV_CMD_NAV_LOITER_TURNS", {
        latitude: (cur.params as any).latitude,
        longitude: (cur.params as any).longitude,
        radius: (cur.params as any).radius,
        turns: (cur.params as any).turns + (next.params as any).turns,
        altitude: (next.params as any).altitude,
        "": 1
      }))
      i++ // Skip the next waypoint as it's been combined
    } else if (cur.type === 16 && next.type === 16 && areWaypointsAtSameLocation(cur, next)) {
      // Two consecutive waypoints at same location, add one and skip the next
      simplifiedMavWP.push(wps[i])
      i++
    } else {
      // Add waypoint as-is
      simplifiedMavWP.push(wps[i])
    }
  }

  // Remove loiter turns with insignificant turn amounts
  return simplifiedMavWP.filter((x) => (x.type !== 18 || x.params.turns > 0.03))
}

/**
 * Converts waypoint commands to MAVLink format with Dubins path interpolation
 * @param wps Array of waypoint commands to convert
 * @param reference Reference point for coordinate conversion
 * @returns Array of MAVLink commands
 */
export function convertToMAV(wps: Command[], reference: LatLng): MavCommand[] {
  console.log(wps)

  if (wps.length === 0) return [];

  // Process Dubins runs and convert to waypoints
  let convertedRuns: { start: number, wps: Command[], length: number }[] = []

  const mainLine = convertToMainLine(wps)
  const runs = splitDubinsRuns(mainLine)
  
  for (const run of runs) {
    let otherCount = 0
    const dubinsPoints = run.run.map((x) => waypointToDubins(x.cmd, reference))
    const path = dubinsBetweenDubins(dubinsPoints)
    const dubinsPaths = path.map((x) => localiseDubinsPath(x, reference))
    let newMavWP: Command[] = []

    for (let i = 0; i < dubinsPaths.length; i++) {
      const section = dubinsPaths[i]

      // Calculate segment lengths
      const turnALen = Math.abs(section.turnA.theta * section.turnA.radius)
      const straightLen = haversineDistance(section.straight.start, section.straight.end)
      const turnBLen = Math.abs(section.turnB.theta * section.turnB.radius)
      const totalDistance = turnALen + straightLen + turnBLen

      // Get altitude values for interpolation
      const startAlt = run.run[i].cmd.params.altitude
      const endAlt = run.run[i + 1].cmd.params.altitude

      // ###### Turn A ######
      const absThetaA = Math.abs(section.turnA.theta / (Math.PI * 2))
      const dirA = absThetaA !== 0 ? (absThetaA / (section.turnA.theta / (Math.PI * 2))) : 1

      // Add the do commands if we're just beginning a dubins path
      newMavWP = newMavWP.concat(run.run[i].other)
      otherCount += run.run[i].other.length

      // Add turn command if significant
      if (Math.abs(section.turnA.radius) > 0 && absThetaA > 0.03) {
        const turnAAlt = calculateInterpolatedAltitude(startAlt, endAlt, turnALen, totalDistance)
        
        newMavWP.push(makeCommand("MAV_CMD_NAV_LOITER_TURNS", {
          turns: Number(absThetaA.toFixed(4)),
          "": 1, // Magic exit tangent
          altitude: turnAAlt,
          radius: Number((section.turnA.radius * dirA).toFixed(4)),
          latitude: section.turnA.center.lat,
          longitude: section.turnA.center.lng
        }))
      }

      // ###### Straight Section ######
      const straightAlt = calculateInterpolatedAltitude(startAlt, endAlt, turnALen + straightLen, totalDistance)
      
      newMavWP.push(makeCommand("MAV_CMD_NAV_WAYPOINT", {
        yaw: 0,
        "accept radius": 0,
        latitude: section.straight.end.lat,
        longitude: section.straight.end.lng,
        hold: 0,
        altitude: straightAlt,
        "pass radius": 0
      }))

      // ###### Turn B ######
      const absThetaB = Math.abs(section.turnB.theta / (Math.PI * 2))
      const dirB = absThetaB !== 0 ? (absThetaB / (section.turnB.theta / (Math.PI * 2))) : 1

      // Add turn command if significant
      if (Math.abs(section.turnB.radius) > 0 && absThetaB > 0.03) {
        newMavWP.push(makeCommand("MAV_CMD_NAV_LOITER_TURNS", {
          turns: Number(absThetaB.toFixed(4)),
          "": 1, // Magic exit tangent
          altitude: endAlt,
          radius: Number((section.turnB.radius * dirB).toFixed(4)),
          latitude: section.turnB.center.lat,
          longitude: section.turnB.center.lng
        }))
      }

      // Add waypoint if the next segment curves in the opposite direction
      const next = dubinsPaths[i + 1]
      if (next !== undefined && next.turnA.theta * section.turnB.theta < 0) {
        const pos = worldOffset(section.turnA.center, section.turnA.radius, section.turnA.start + section.turnA.theta)
        newMavWP.push(makeCommand("MAV_CMD_NAV_WAYPOINT", { 
          yaw: 0, 
          "accept radius": 0, 
          latitude: pos.lat, 
          longitude: pos.lng, 
          hold: 0, 
          altitude: startAlt, 
          "pass radius": 0 
        }))
      }
    }

    const simplifiedWaypoints = simplifyDubinsWaypoints(newMavWP)
    convertedRuns.push({ 
      start: run.start, 
      wps: simplifiedWaypoints, 
      length: run.run.length - run.run.filter((x) => x.cmd.type !== 69).length + otherCount 
    })
  }

  // Compile into single mission
  let ret: Command[] = []
  for (let i = 0; i < wps.length; i++) {
    const run = convertedRuns.find((x) => x.start === i)
    if (run === undefined) {
      ret.push(wps[i])
    } else {
      ret = ret.concat(run.wps)
      i += run.length
    }
  }

  // Validate that no Dubins commands remain
  ret.forEach((x) => { 
    console.assert(x.type !== 69, "Dubins command found in final output - this should not happen") 
  })
  
  return WPM2MAV(ret)
}

/**
 * Downloads text content as a file to the user's device
 * @param filename Name of the file to download
 * @param text Text content to download
 */
export function downloadTextAsFile(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(link.href); // Clean up memory
}

export type importInterface = (missionStr: string) => Result<{ mission: Mission, vehicle: Vehicle }>

/**
 * Parses a mission string using various import formats
 * @param missionStr Mission string to parse
 * @returns Result containing parsed mission and vehicle data, or error
 */
export function parseMissionString(missionStr: string): Result<{ mission: Mission, vehicle: Vehicle }> {
  if (!missionStr || missionStr.trim().length === 0) {
    return { data: null, error: new Error("Empty mission string provided") }
  }

  const importFuncs: importInterface[] = [
    importqgcWaypoints,
    importwpm2,
    importwpm1
  ]
  
  const errors: Error[] = []
  
  for (let i = 0; i < importFuncs.length; i++) {
    const curAlg = importFuncs[i]
    try {
      const res = curAlg(missionStr)
      if (res.data !== null && isValidMission(res.data.mission)) {
        return res
      }
      if (res.error) {
        errors.push(res.error)
      }
    } catch (err) {
      errors.push(err instanceof Error ? err : new Error(String(err)))
      continue
    }
  }
  
  return { 
    data: null, 
    error: new Error(`No valid import methods found. Errors: ${errors.map(e => e.message).join(', ')}`) 
  }
}
