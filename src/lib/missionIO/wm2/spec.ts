import { commands } from "@/lib/commands/commands";
import { Mission } from "@/lib/waypoints/waypointCollection";

const commandInts = commands.map((x) => x.value)

export function isValidMission(mission: Mission): boolean {

  const missions = mission.getMissions()
  for (const subMission of missions) {
    const cmds = mission.get(subMission)
    for (const cmd of cmds) {
      if (cmd.type == "Command") {
        if (cmd.cmd === undefined) return false
        if (!commandInts.includes(cmd.cmd.type)) return false
        if (cmd.cmd.params === undefined) {
          return false
        }
        const paramNames = Object.keys(cmd.cmd.params)
      } else if (cmd.type == "Collection") {
      } else {
        return false
      }
    }
  }
  return true
}

export function importwpm2(a: string): Mission | undefined {
  const ret = new Mission(new Map(JSON.parse(a)))
  if (isValidMission(ret)) {
    return ret
  } else {
    return undefined
  }
}
