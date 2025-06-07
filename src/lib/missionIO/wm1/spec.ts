import { CommandValue, getCommandDesc } from "@/lib/commands/commands";
import { Mission } from "@/lib/mission/mission";
import { defaultPlane } from "@/lib/vehicles/defaults";
import { importInterface } from "../common";

export const importwpm1: importInterface = (missionStr: string) => {
  try {
    const newMission: Map<string, any[]> = new Map(JSON.parse(missionStr))

    const newWPC = new Mission();

    // add all the sub missions as empty missions
    for (const subMissionName of Array.from(newMission.keys())) {
      newWPC.addSubMission(subMissionName)
    }

    for (const subMissionName of Array.from(newMission.keys())) {
      // @ts-ignore
      for (const newCommand of newMission.get(subMissionName)) {
        if (newCommand.type == "Waypoint") {
          let params = {}
          const cmdDef = getCommandDesc(newCommand.wps.type)
          for (let i = 1; i <= 7; i++) {
            let a = cmdDef?.parameters[i - 1]?.label.toLowerCase()
            if (a !== undefined) {
              //@ts-ignore
              params[a] = newCommand.wps["param" + i]
            }
          }
          newWPC.pushToMission(subMissionName, {
            type: "Command",
            //@ts-ignore
            cmd: {
              frame: newCommand.wps.frame,
              type: newCommand.wps.type as CommandValue,
              autocontinue: newCommand.wps.autocontinue,
              params: params
            }
          }
          )
        } else if (newCommand.type == "Collection") {
          newWPC.pushToMission(subMissionName, newCommand)
        }
      }
    }
    return {
      data: {
        mission: newWPC,
        vehicle: defaultPlane
      }, error: null
    }
  } catch (err) {
    return { data: null, error: err as Error }
  }
}
