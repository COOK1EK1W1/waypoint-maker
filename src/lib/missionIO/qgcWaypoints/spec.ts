import { convertToMAV, importInterface } from "../common"
import { Mission } from "@/lib/mission/mission";
import { commands, CommandValue, MavCommand } from "@/lib/commands/commands"
import { defaultPlane } from "@/lib/vehicles/defaults";
import { makeCommand } from "@/lib/commands/default";
import { WPM2MAV } from "@/lib/commands/convert";

export function exportqgcWaypoints(mission: Mission) {
  let returnString = "QGC WPL 110\n"

  const reference = mission.getReferencePoint()
  const wps = mission.flatten("Main")
  const mavCommands = convertToMAV(wps, reference)
  returnString += waypointString(0, WPM2MAV([makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: reference.lat, longitude: reference.lng, altitude: 0 })])[0])

  mavCommands.forEach((x, i) => {
    returnString += waypointString(i + 1, x)
  })

  return returnString
}

function waypointString(i: number, wp: MavCommand): string {
  return `${i}\t${i == 0 ? "1" : "0"}\t${wp.frame}\t${wp.type}\t${wp.param1}\t${wp.param2}\t${wp.param3}\t${wp.param4}\t${wp.param5}\t${wp.param6}\t${wp.param7}\t${wp.autocontinue}\n`
}

export const importqgcWaypoints: importInterface = (missionStr: string) => {
  const newMission = new Mission()
  const b = missionStr.trim().split("\n")
  if (b[0] !== "QGC WPL 110") { return { data: null, error: Error("incompatible qgc version") } }
  for (let i = 1; i < b.length; i++) {
    const curLine = b[i];
    const params = curLine.split("\t")

    let cmdParams = {}
    const cmdDef = commands.find((x) => x.value == parseInt(params[3], 10))
    for (let i = 4; i <= 10; i++) {
      let a = cmdDef?.parameters[i - 4]?.label.toLowerCase()
      if (a !== undefined) {
        //@ts-ignore
        cmdParams[a] = parseFloat(params[i], 10)
      }
    }
    newMission.pushToMission("Main", {
      type: "Command",
      //@ts-ignore
      cmd: { frame: parseInt(params[2], 10), type: parseInt(params[3], 10) as CommandValue, autocontinue: parseInt(params[11]), params: cmdParams }
    })

  }
  return { data: { mission: newMission, vehicle: defaultPlane }, error: null }

}
