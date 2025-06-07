import { dubinsBetweenDubins, localisePath, splitDubinsRuns, waypointToDubins } from "@/lib/dubins/dubinWaypoints";
import { LatLng } from "../world/latlng";
import { Command, MavCommand } from "../commands/commands";
import { WPM2MAV } from "../commands/convert";
import { importqgcWaypoints } from "./qgcWaypoints/spec";
import { importwpm2, isValidMission } from "./wm2/spec";
import { importwpm1 } from "./wm1/spec";
import { Mission } from "@/lib/mission/mission";
import { Vehicle } from "../vehicles/types";
import { makeCommand } from "../commands/default";
import { Result } from "@/util/try-catch";
import { worldOffset } from "../world/distance";

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
      && cur.params.radius == next.params.radius) {
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

  const runs = splitDubinsRuns(wps)
  for (const run of runs) {
    const dubinsPoints = run.wps.map((x) => waypointToDubins(x, reference))
    const path = dubinsBetweenDubins(dubinsPoints)
    const worldPath = localisePath(path, reference)
    let newMavWP: Command[] = []

    for (let i = 0; i < worldPath.length; i++) {
      const section = worldPath[i]
      const curWaypoint = Math.floor(i / 3)
      switch (section.type) {
        case "Curve": {
          const absTheta = Math.abs(section.theta / (Math.PI * 2))
          const dir = absTheta / (section.theta / (Math.PI * 2))
          if (Math.abs(section.radius) === 0 || absTheta < 0.03) break;
          //@ts-ignore
          newMavWP.push(makeCommand("MAV_CMD_NAV_LOITER_TURNS", { turns: Number(absTheta.toFixed(4)), "": 1, altitude: run.wps[curWaypoint].params.altitude, radius: Number((section.radius * dir).toFixed(4)), latitude: section.center.lat, longitude: section.center.lng }))


          const next = worldPath[i + 1]
          if (next !== undefined && next.type === "Curve" && next.theta * section.theta < 0) {
            const pos = worldOffset(section.center, section.radius, section.start + section.theta)
            //@ts-ignore
            newMavWP.push(makeCommand("MAV_CMD_NAV_WAYPOINT", { yaw: 0, "accept radius": 0, latitude: pos.lat, longitude: pos.lng, hold: 0, altitude: run.wps[curWaypoint].params.altitude, "pass radius": 0 }))
          }

          break
        }
        case "Straight": {
          //@ts-ignore
          newMavWP.push(makeCommand("MAV_CMD_NAV_WAYPOINT", { yaw: 0, "accept radius": 0, latitude: section.end.lat, longitude: section.end.lng, hold: 0, altitude: run.wps[curWaypoint].params.altitude, "pass radius": 0 }))
          break
        }

      }
      convertedRuns.push()

    }

    const simplifiedWaypoints = simplifyDubinsWaypoints(newMavWP)

    convertedRuns.push({ start: run.start, wps: simplifiedWaypoints, length: run.wps.length - run.wps.filter((x) => x.type != 69).length })
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
