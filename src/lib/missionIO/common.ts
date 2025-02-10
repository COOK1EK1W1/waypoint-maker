import { Waypoint } from "@/types/waypoints";
import { dubinsBetweenDubins, localisePath, splitDubinsRuns, waypointToDubins } from "@/lib/dubins/dubinWaypoints";
import { LatLng } from "@/types/dubins";

export function simplifyDubinsWaypoints(wps: Waypoint[]) {
  // simplify dubins runs
  let simplifiedMavWP: Waypoint[] = []
  for (let i = 0; i < wps.length - 1; i++) {
    if (wps[i].type == 18 && wps[i + 1].type == 18 && wps[i].param5 == wps[i + 1].param5 && wps[i].param6 == wps[i + 1].param6 && wps[i].param3 == wps[i + 1].param3) {
      simplifiedMavWP.push({ frame: 3, type: 18, param1: wps[i].param1 + wps[i + 1].param1, param2: 0, param3: wps[i].param3, param4: 1, param5: wps[i].param5, param6: wps[i].param6, param7: wps[i + 1].param7, autocontinue: 1 })
      i++
    } else {
      simplifiedMavWP.push(wps[i])
    }
  }
  simplifiedMavWP = simplifiedMavWP.filter((x) => (x.type != 18 || x.param1 > 0.03))
  return simplifiedMavWP
}

export function convertToMAV(wps: Waypoint[], reference: LatLng): Waypoint[] {

  // render the dubins runs to waypoints
  let convertedRuns: { start: number, wps: Waypoint[], length: number }[] = []

  const runs = splitDubinsRuns(wps)
  for (const run of runs) {
    const dubinsPoints = run.wps.map((x) => waypointToDubins(x, reference))
    const path = dubinsBetweenDubins(dubinsPoints)
    const worldPath = localisePath(path, reference)
    let newMavWP: Waypoint[] = []
    for (let i = 0; i < worldPath.length; i++) {
      const section = worldPath[i]
      const curWaypoint = Math.floor(i / 3)
      switch (section.type) {
        case "Curve": {
          const absTheta = Math.abs(section.theta / (Math.PI * 2))
          const dir = absTheta / (section.theta / (Math.PI * 2))
          newMavWP.push({ frame: 3, type: 18, param1: absTheta, param2: 0, param3: section.radius * dir, param4: 1, param5: section.center.lat, param6: section.center.lng, param7: run.wps[curWaypoint].param7, autocontinue: 1 })
          break
        }
        case "Straight": {
          newMavWP.push({ frame: 3, type: 16, param1: 0, param2: 0, param3: 0, param4: 0, param5: section.end.lat, param6: section.end.lng, param7: run.wps[curWaypoint].param7, autocontinue: 1 })
          break
        }

      }
      convertedRuns.push()

    }
    const simplifiedWaypoints = simplifyDubinsWaypoints(newMavWP)

    convertedRuns.push({ start: run.start, wps: simplifiedWaypoints, length: run.wps.length })
  }

  // compile into single mission
  let ret: Waypoint[] = []
  for (let i = 0; i < wps.length; i++) {
    let run = convertedRuns.find((x) => x.start == i)
    if (run == undefined) {
      ret.push(wps[i])
    } else {
      ret = ret.concat(run.wps)
      i += run.length
    }
  }

  return ret
}

export function downloadTextAsFile(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
