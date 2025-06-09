import { dubinsBetweenDubins, localisePath, splitDubinsRuns, waypointToDubins } from "@/lib/dubins/dubinWaypoints";
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
    const worldPath = localisePath(path, reference)
    let newMavWP: Command[] = []

    for (let i = 0; i < worldPath.length; i++) {
      const section = worldPath[i]
      const curWaypoint = Math.floor(i / 3)
      const segmentId = i % 3

      // @ts-ignore
      const turnALen = worldPath[curWaypoint * 3].theta * worldPath[curWaypoint * 3].radius
      // @ts-ignore
      const straightLen = haversineDistance(worldPath[curWaypoint * 3 + 1].start, worldPath[curWaypoint * 3 + 1].end)
      // @ts-ignore
      const turnBLen = worldPath[curWaypoint * 3 + 2].theta * worldPath[curWaypoint * 3 + 2].radius

      const totalDistance = turnALen + straightLen + turnBLen

      switch (section.type) {
        case "Curve": {
          const absTheta = Math.abs(section.theta / (Math.PI * 2))
          const dir = absTheta / (section.theta / (Math.PI * 2))

          // add the do commands if we're just beginning a dubins path
          if (segmentId === 0) {
            newMavWP = newMavWP.concat(run.run[curWaypoint].other)
            otherCount += run.run[curWaypoint].other.length
          }

          // no need for a turn as it's bascially nothing
          if (Math.abs(section.radius) === 0 || absTheta < 0.03) break;

          newMavWP.push(makeCommand("MAV_CMD_NAV_LOITER_TURNS", {
            turns: Number(absTheta.toFixed(4)),
            "": 1, //magic exit tangent lol
            altitude: segmentId === 0 ? run.run[curWaypoint].cmd.params.altitude + ((turnALen) / totalDistance) * (run.run[curWaypoint + 1].cmd.params.altitude - run.run[curWaypoint].cmd.params.altitude) : run.run[curWaypoint + 1].cmd.params.altitude,
            radius: Number((section.radius * dir).toFixed(4)),
            latitude: section.center.lat,
            longitude: section.center.lng
          }))


          const next = worldPath[i + 1]
          if (next !== undefined && next.type === "Curve" && next.theta * section.theta < 0) {
            const pos = worldOffset(section.center, section.radius, section.start + section.theta)
            newMavWP.push(makeCommand("MAV_CMD_NAV_WAYPOINT", { yaw: 0, "accept radius": 0, latitude: pos.lat, longitude: pos.lng, hold: 0, altitude: run.run[curWaypoint].cmd.params.altitude, "pass radius": 0 }))
          }


          break
        }
        case "Straight": {
          newMavWP.push(makeCommand("MAV_CMD_NAV_WAYPOINT", {
            yaw: 0,
            "accept radius": 0,
            latitude: section.end.lat,
            longitude: section.end.lng,
            hold: 0,
            altitude: run.run[curWaypoint].cmd.params.altitude + ((turnALen + straightLen) / totalDistance) * (run.run[curWaypoint + 1].cmd.params.altitude - run.run[curWaypoint].cmd.params.altitude),
            "pass radius": 0
          }))
          break
        }
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
