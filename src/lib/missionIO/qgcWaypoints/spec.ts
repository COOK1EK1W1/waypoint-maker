import { MavCommand } from "@/lib/commands/types"
import { convertToMAV } from "../common"
import { Mission } from "@/lib/mission/mission";
import { commands, CommandValue } from "@/lib/commands/commands"

export function exportqgcWaypoints(mission: Mission) {
  let returnString = "QGC WPL 110\n"

  let wps = mission.flatten("Main")
  let mavCommands = convertToMAV(wps, mission.getReferencePoint())

  for (let i = 0; i < wps.length; i++) {
    returnString += waypointString(i, mavCommands[i])
  }
  return returnString
}

function waypointString(i: number, wp: MavCommand): string {
  return `${i}\t${i == 0 ? "1" : "0"}\t${wp.frame}\t${wp.type}\t${wp.param1}\t${wp.param2}\t${wp.param3}\t${wp.param4}\t${wp.param5}\t${wp.param6}\t${wp.param7}\t${wp.autocontinue}\n`
}

export function importqgcWaypoints(a: string): Mission | undefined {
  const newMission = new Mission()
  const b = a.trim().split("\n")
  if (b[0] !== "QGC WPL 110") { return undefined }
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
      cmd: {
        frame: parseInt(params[2], 10),
        type: parseInt(params[3], 10) as CommandValue,
        autocontinue: parseInt(params[11]),
        params: cmdParams
      }

    })

  }
  return newMission

}
