import { Waypoint } from "@/types/waypoints";
import { dubinsBetweenWaypoint, splitDubinsRuns } from "@/lib/dubins/dubinWaypoints";
import { LatLng } from "@/types/dubins";

export function convertToMAV(wps: Waypoint[], reference: LatLng): Waypoint[] {

  // render the dubins runs to waypoints
  const runs = splitDubinsRuns(wps)
  let convertedRuns: { start: number, wps: Waypoint[], length: number }[] = []
  for (let section of runs) {
    let newMavWP: Waypoint[] = []
    for (let i = 0; i < section.wps.length - 1; i++) {
      let path = dubinsBetweenWaypoint(section.wps[i], section.wps[i + 1], reference)
      const c1 = path[0]
      if (c1.type == "Curve") {
        const absTheta = Math.abs(c1.theta / (Math.PI * 2))
        const dir = absTheta / (c1.theta / (Math.PI * 2))
        newMavWP.push({ frame: 3, type: 18, param1: absTheta, param2: 0, param3: c1.radius * dir, param4: 1, param5: c1.center.y, param6: c1.center.x, param7: section.wps[i].param7, autocontinue: 1 })
      }
      const s = path[1]
      if (s.type == "Straight") {
        newMavWP.push({ frame: 3, type: 16, param1: 0, param2: 0, param3: 0, param4: 1, param5: s.end.y, param6: s.end.x, param7: section.wps[i + 1].param7, autocontinue: 1 })
      }
      const c2 = path[2]
      if (c2.type == "Curve") {
        const absTheta = Math.abs(c2.theta / (Math.PI * 2))
        const dir = absTheta / (c2.theta / (Math.PI * 2))
        newMavWP.push({ frame: 3, type: 18, param1: absTheta, param2: 0, param3: c2.radius * dir, param4: 1, param5: c2.center.y, param6: c2.center.x, param7: section.wps[i].param7, autocontinue: 1 })
      }
    }

    // simplify dubins runs
    let simplifiedMavWP: Waypoint[] = []
    for (let i = 0; i < newMavWP.length - 1; i++) {
      if (newMavWP[i].type == 18 && newMavWP[i + 1].type == 18 && newMavWP[i].param5 == newMavWP[i + 1].param5 && newMavWP[i].param6 == newMavWP[i + 1].param6 && newMavWP[i].param3 == newMavWP[i + 1].param3) {
        simplifiedMavWP.push({ frame: 3, type: 18, param1: newMavWP[i].param1 + newMavWP[i + 1].param1, param2: 0, param3: newMavWP[i].param3, param4: 1, param5: newMavWP[i].param5, param6: newMavWP[i].param6, param7: newMavWP[i + 1].param7, autocontinue: 1 })

        i++
      } else {
        simplifiedMavWP.push(newMavWP[i])
      }
    }

    convertedRuns.push({ start: section.start, wps: simplifiedMavWP, length: section.wps.length })
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
