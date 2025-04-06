import { mavCmds } from "./mavCommands";
import { wpmCmds } from "./wpmCommands";

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

//let a: WPMCommand = { type: 16, frame: 1, autocontinue: 1, params: { "accept radius": 10, hold: 0, altitude: 10, latitude: 10, longitude: 10, "pass radius": 10, yaw: 10 } }

//a.params.yaw = 10


export type CommandName = typeof commands[number]["name"]
export type CommandValue = typeof commands[number]["value"]
