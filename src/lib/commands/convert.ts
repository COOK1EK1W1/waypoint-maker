import { objectKeys } from "@/util/types";
import { Command } from "./commands";
import { MavCommand } from "./types";
import { mavCmds } from "./mav/commands";

export function WPM2MAV(commands: Command[]): MavCommand[] {
  const ret: MavCommand[] = []
  commands.forEach((cur) => {
    const cmd = mavCmds.find((x) => x.value == cur.type)
    let a: MavCommand = {
      type: cur.type as (typeof mavCmds)[number]["value"],
      frame: cur.frame,
      autocontinue: 1,
      param1: 0,
      param2: 0,
      param3: 0,
      param4: 0,
      param5: 0,
      param6: 0,
      param7: 0,
    }
    Object.keys(cur.params).forEach(element => {
      const desc = cmd?.parameters.find((x) => x?.label.toLowerCase() == element)
      if (!!desc) {
        //@ts-ignore
        a["param" + desc.index] = cur.params[element]
      }
    });
    ret.push(a)
  })

  return ret
}
