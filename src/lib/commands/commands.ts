import { mavCmds } from "./mav/commands";
import { wpmCmds } from "./wpm/wpmCommands";

export const commands = [...mavCmds, ...wpmCmds] as const

// Extract only non-null parameters and map them to an object
export type CommandParamsNames<T extends CommandName> = NonNullable<
  Extract<
    typeof commands[number],
    { name: T }
  >["parameters"][number]
>["label"]

// Create a type to map command names to parameter objects, excluding `null` entries
export type CommandParams<T extends CommandName> = {
  [P in CommandParamsNames<T> as P extends string ? Lowercase<P> : never]: number
}

export type ICommand<T extends CommandName> = {
  frame: number
  type: Extract<typeof commands[number], { name: T }>["value"]
  autocontinue: number
  params: CommandParams<T>
}

export type Command = { [K in CommandName]: ICommand<K> }[CommandName]


export type CommandName = typeof commands[number]["name"]
export type CommandValue = typeof commands[number]["value"]



// ####################################################
// #                 Lat Lng Commands                 #
// ####################################################

export type LatLngCommand = {
  [K in CommandName]:
  "Latitude" extends CommandParamsNames<K>
  ? ("Longitude" extends CommandParamsNames<K> ? ICommand<K> : never)
  : never
}[CommandName]

export type LatLngAltCommand = {
  [K in CommandName]:
  "Latitude" extends CommandParamsNames<K>
  ? ("Longitude" extends CommandParamsNames<K> ? ("Altitude" extends CommandParamsNames<K> ? ICommand<K> : never) : never)
  : never
}[CommandName]

export function filterLatLngCmds(cmds: Command[]): LatLngCommand[] {
  return cmds.filter((x) => "latitude" in x.params && "longitude" in x.params) as LatLngCommand[]
}

export function filterLatLngAltCmds(cmds: Command[]): LatLngAltCommand[] {
  return cmds.filter((x) => "latitude" in x.params && "longitude" in x.params && "altitude" in x.params) as LatLngAltCommand[]

}

