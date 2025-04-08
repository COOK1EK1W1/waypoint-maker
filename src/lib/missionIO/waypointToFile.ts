import { Mission } from "@/lib/waypoints/waypointCollection";
import { convertToMAV } from "@/lib/missionIO/common";
import { MavCommand } from "../commands/types";

export function waypointTo_waypoints_file(waypoints: Mission) {
  let returnString = "QGC WPL 110\n"

  let wps = waypoints.flatten("Main")
  let mavCommands = convertToMAV(wps, waypoints.getReferencePoint())

  for (let i = 0; i < wps.length; i++) {
    returnString += waypointString(i, mavCommands[i])
  }
  return returnString
}

function waypointString(i: number, wp: MavCommand): string {
  return `${i}\t${i == 0 ? "1" : "0"}\t${wp.frame}\t${wp.type}\t${wp.param1}\t${wp.param2}\t${wp.param3}\t${wp.param4}\t${wp.param5}\t${wp.param6}\t${wp.param7}\t${wp.autocontinue}\n`
}

