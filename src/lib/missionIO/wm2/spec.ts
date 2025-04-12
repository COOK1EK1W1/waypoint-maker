import { commands } from "@/lib/commands/commands";
import { Mission } from "@/lib/mission/mission";
import { Vehicle } from "@/lib/vehicles/types";

const commandInts = commands.map((x) => x.value)

export function isValidMission(mission: Mission): boolean {
  try {

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
  } catch (err) {
    return false
  }
}

export function importwpm2(a: string): { mission: Mission, vehicle: Vehicle } | undefined {
  try {
    const parsed = JSON.parse(a)
    if ("mission" in parsed && "vehicle" in parsed) {
      return {
        mission: new Mission(new Map(parsed.mission)),
        vehicle: parsed.vehicle
      }
    } else { return undefined }
  } catch (err) {
    return undefined
  }
}

export function exportwpm2(mission: Mission, vehicle: Vehicle) {
  const a = {
    version: 2,
    vehicle: vehicle,
    mission: Array.from(mission.destructure())
  }
  return JSON.stringify(a, null, 2)
}
