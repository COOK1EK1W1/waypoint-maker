import { mavCmds } from "./mavCommands";
import { wpmCmds } from "./wpmCommands";

export const commands = [...mavCmds, ...wpmCmds] as const

export type Command = {
  frame: number
  type: number

  param1: number
  param2: number
  param3: number
  param4: number
  param5: number
  param6: number
  param7: number

  autocontinue: number
}
