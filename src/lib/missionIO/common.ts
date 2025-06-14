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
import { pathLength } from "../dubins/geometry";
import { string } from "better-auth";

export function simplifyDubinsWaypoints(wps: Command[]) {

  // simplify dubins runs
  const simplifiedMavWP: Command[] = []
  for (let i = 0; i < wps.length; i++) {
    const cur = wps[i]
    const next = wps[i + 1]

    if (next === undefined) {
      simplifiedMavWP.push(wps[i])
      break
    }

    // if current and next are both loiter turns and are in the same place, combine them
    if (cur.type == 18 && next.type == 18 && cur.params.longitude == next.params.longitude
      && cur.params.latitude == next.params.latitude
      && cur.params.radius == next.params.radius
      && cur.params.altitude == next.params.altitude) {
      simplifiedMavWP.push(makeCommand("MAV_CMD_NAV_LOITER_TURNS", {
        latitude: cur.params.latitude,
        longitude: cur.params.longitude,
        radius: cur.params.radius,
        turns: cur.params.turns + next.params.turns,
        altitude: next.params.altitude,
        "": 1
      }))
      i++
    } else if (cur.type == 16 && next.type == 16 && cur.params.longitude == next.params.longitude && cur.params.longitude == next.params.latitude) {
      // two consecutive waypoints, add one and skip the next
      simplifiedMavWP.push(wps[i])
      i++
    } else {
      // else just add waypoint
      simplifiedMavWP.push(wps[i])
    }
  }

  // remove loiter turns with small turn amounts and with no radius
  return simplifiedMavWP.filter((x) => (x.type != 18 || x.params.turns > 0.03))
}

export function convertToMAV(wps: Command[], reference: LatLng): MavCommand[] {

  // render the dubins runs to waypoints
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

      const turnALen = section.turnA.theta * section.turnA.radius
      const straightLen = haversineDistance(section.straight.start, section.straight.end)
      const turnBLen = section.turnB.theta * section.turnB.radius

      const totalDistance = turnALen + straightLen + turnBLen

      // ###### Turn A ######

      // get the direction of the turn
      const absThetaA = Math.abs(section.turnA.theta / (Math.PI * 2))
      const dirA = absThetaA / (section.turnA.theta / (Math.PI * 2))

      // add the do commands if we're just beginning a dubins path
      newMavWP = newMavWP.concat(run.run[i].other)
      otherCount += run.run[i].other.length

      // no need for a turn as it's bascially nothing
      if (Math.abs(section.turnA.radius) > 0 && absThetaA > 0.03) {

        newMavWP.push(makeCommand("MAV_CMD_NAV_LOITER_TURNS", {
          turns: Number(absThetaA.toFixed(4)),
          "": 1, //magic exit tangent lol
          altitude: run.run[i].cmd.params.altitude + ((turnALen) / totalDistance) * (run.run[i + 1].cmd.params.altitude - run.run[i].cmd.params.altitude),
          radius: Number((section.turnA.radius * dirA).toFixed(4)),
          latitude: section.turnA.center.lat,
          longitude: section.turnA.center.lng
        }))

    }

      // ###### Straight ######

      newMavWP.push(makeCommand("MAV_CMD_NAV_WAYPOINT", {
        yaw: 0,
        "accept radius": 0,
        latitude: section.straight.end.lat,
        longitude: section.straight.end.lng,
        hold: 0,
        altitude: run.run[i].cmd.params.altitude + ((turnALen + straightLen) / totalDistance) * (run.run[i + 1].cmd.params.altitude - run.run[i].cmd.params.altitude),
        "pass radius": 0
      }))

      // ###### Turn B ######

      // get the direction of the turn
      const absThetaB = Math.abs(section.turnB.theta / (Math.PI * 2))
      const dirB = absThetaB / (section.turnB.theta / (Math.PI * 2))

      // no need for a turn as it's bascially nothing
      if (Math.abs(section.turnB.radius) > 0 && absThetaB > 0.03){

        // add the turn command
        newMavWP.push(makeCommand("MAV_CMD_NAV_LOITER_TURNS", {
          turns: Number(absThetaB.toFixed(4)),
          "": 1, //magic exit tangent lol
          altitude: run.run[i + 1].cmd.params.altitude,
          radius: Number((section.turnB.radius * dirB).toFixed(4)),
          latitude: section.turnB.center.lat,
          longitude: section.turnB.center.lng
        }))
      }

      // place waypoint if the next segment of the next dubins path is a curve going in the other direc
      const next = dubinsPaths[i + 1]
      if (next !== undefined && next.turnA.theta * section.turnB.theta < 0) {
        const pos = worldOffset(section.turnA.center, section.turnA.radius, section.turnA.start + section.turnA.theta)
        newMavWP.push(makeCommand("MAV_CMD_NAV_WAYPOINT", { yaw: 0, "accept radius": 0, latitude: pos.lat, longitude: pos.lng, hold: 0, altitude: run.run[i].cmd.params.altitude, "pass radius": 0 }))
      }
    }

    const simplifiedWaypoints = simplifyDubinsWaypoints(newMavWP)

    convertedRuns.push({ start: run.start, wps: simplifiedWaypoints, length: run.run.length - run.run.filter((x) => x.cmd.type != 69).length + otherCount })
  }

  // compile into single mission
  let ret: Command[] = []
  for (let i = 0; i < wps.length; i++) {
    let run = convertedRuns.find((x) => x.start == i)
    if (run == undefined) {
      ret.push(wps[i])
    } else {
      ret = ret.concat(run.wps)
      i += run.length
    }
  }

  ret.map((x) => { console.assert(x.type != 69, "dubins found :skull: ") })
  return WPM2MAV(ret)
}

// helper function to download some text as a file
export function downloadTextAsFile(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export type importInterface = (missionStr: string) => Result<{ mission: Mission, vehicle: Vehicle }>

// parse a generic mission string
export function parseMissionString(a: string): Result<{ mission: Mission, vehicle: Vehicle }> {
  const importFuncs: importInterface[] = [
    importqgcWaypoints,
    importwpm2,
    importwpm1
  ]
  for (let i = 0; i < importFuncs.length; i++) {
    const curAlg = importFuncs[i]
    try {
      const res = curAlg(a)
      if (res.data !== null && isValidMission(res.data.mission)) {
        return res
      }
    } catch (err) {
      continue
    }
  }
  return { data: null, error: Error("No valid import methods") }
}
