import { Waypoint } from "@/types/waypoints";
import { WaypointCollection } from "@/lib/waypoints/waypointCollection";
import { dubinsBetweenWaypoint, splitDubinsRuns } from "@/lib/dubins/dubinWaypoints";

export function convertToMAV(wps: Waypoint[]): Waypoint[] {

  const runs = splitDubinsRuns(wps)
  let convertedRuns: { start: number, wps: Waypoint[], length: number }[] = []
  for (let section of runs) {
    let newMavWP: Waypoint[] = []
    for (let i = 0; i < section.wps.length - 1; i++) {
      let path = dubinsBetweenWaypoint(section.wps[i], section.wps[i + 1], wps[0])
      const c1 = path[0]
      if (c1.type == "Curve") {
        newMavWP.push({ frame: 3, type: 18, param1: c1.theta / (Math.PI * 2), param2: 0, param3: c1.radius, param4: 1, param5: c1.center.y, param6: c1.center.x, param7: section.wps[i].param7, autocontinue: 1 })
      }
      const s = path[1]
      if (s.type == "Straight") {
        newMavWP.push({ frame: 3, type: 16, param1: 0, param2: 0, param3: 0, param4: 1, param5: s.end.y, param6: s.end.x, param7: section.wps[i + 1].param7, autocontinue: 1 })
      }
      const c2 = path[2]
      if (c2.type == "Curve") {
        newMavWP.push({ frame: 3, type: 18, param1: c2.theta / (Math.PI * 2), param2: 0, param3: c2.radius, param4: 1, param5: c2.center.y, param6: c2.center.x, param7: section.wps[i].param7, autocontinue: 1 })
      }
    }
    convertedRuns.push({ start: section.start, wps: newMavWP, length: section.wps.length })
  }

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

export function waypointTo_waypoints_file(waypoints: WaypointCollection) {
  let returnString = "QGC WPL 110\n"

  let wps = waypoints.flatten("Main")
  wps = convertToMAV(wps)

  for (let i = 0; i < wps.length; i++) {
    returnString += waypointString(i, wps[i])
  }
  return returnString
}

function waypointString(i: number, wp: Waypoint): string {
  return `${i}\t${i == 0 ? "1" : "0"}\t${wp.frame}\t${wp.type}\t${wp.param1}\t${wp.param2}\t${wp.param3}\t${wp.param4}\t${wp.param5}\t${wp.param6}\t${wp.param7}\t${wp.autocontinue}\n`
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
