import { Command, CommandName, ICommand, CommandParams, MavCommand } from "./commands";
import { mavCmds } from "./mav/commands";
import { makeCommand } from "./default";

/* Convert a waypointmaker Command to mav command
 * @param {Command[]} commands - List of waypoint maker commands
 * @returns MavCommand[] - The commands with 7 params
 */
export function WPM2MAV(commands: Command[]): MavCommand[] {
  const ret: MavCommand[] = []
  commands.forEach((cur) => {
    const cmd = mavCmds.find((x) => x.value == cur.type)
    let a: MavCommand = {
      type: cur.type as (typeof mavCmds)[number]["value"],
      frame: cur.frame,
      autocontinue: 1,
      param1: cmd?.parameters[0] ? cur.params[cmd.parameters[0].label.toLowerCase() as keyof typeof cur.params] : 0,
      param2: cmd?.parameters[1] ? cur.params[cmd.parameters[1].label.toLowerCase() as keyof typeof cur.params] : 0,
      param3: cmd?.parameters[2] ? cur.params[cmd.parameters[2].label.toLowerCase() as keyof typeof cur.params] : 0,
      param4: cmd?.parameters[3] ? cur.params[cmd.parameters[3].label.toLowerCase() as keyof typeof cur.params] : 0,
      param5: cmd?.parameters[4] ? cur.params[cmd.parameters[4].label.toLowerCase() as keyof typeof cur.params] : 0,
      param6: cmd?.parameters[5] ? cur.params[cmd.parameters[5].label.toLowerCase() as keyof typeof cur.params] : 0,
      param7: cmd?.parameters[6] ? cur.params[cmd.parameters[6].label.toLowerCase() as keyof typeof cur.params] : 0,
    }
    ret.push(a)
  })
  return ret
}

/*
 * Coerce one command into another, carry over similar parameters
 * @param {Command} cmd - The from command
 * @param {T} type - The name of the target command type
 * @returns {ICommand<T>} Returns a default Command of type T, or with carried over parameters from cmd
 */
export function coerceCommand<T extends CommandName>(cmd: Command, type: T): ICommand<T> {
  const newCmd = makeCommand(type, {})
  const oldParams = new Set(Object.keys(cmd.params))

  // similar parameter names
  const same = Array.from(Object.keys(newCmd.params)).filter(x => oldParams.has(x))

  const params: { [K in keyof CommandParams<T>]?: number } = {}
  same.forEach((paramName) => {
    const value = cmd.params[paramName as keyof typeof cmd.params]
    if (typeof value === 'number') {
      params[paramName as keyof CommandParams<T>] = value
    }
  })

  // if converting to landing, make altitude 0 
  if (type === "MAV_CMD_NAV_LAND") {
    // @ts-ignore
    params.altitude = 0;
  }

  return makeCommand(type, params)
}
