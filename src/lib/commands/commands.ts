import { mavCmds } from "./mav/commands";
import { wpmCmds } from "./wpm/commands";


// #####################################################
// #                     MavCommand                    #
// #####################################################

export type MavCommand = {
  frame: number
  type: (typeof mavCmds)[number]["value"]

  param1: number
  param2: number
  param3: number
  param4: number
  param5: number
  param6: number
  param7: number

  autocontinue: number
}

// #####################################################
// #                 Command Descriptor                #
// #####################################################

export type ParameterDescription = {
  index: number
  label: string | null
  description: string
  units: string | null
  minValue: number | null
  maxValue: number | null
  increment: number | null
  default: number | null
  options: []
}

export type CommandDescription = {
  value: number
  name: string
  description: string
  hasLocation: boolean
  isDestination: boolean
  parameters: (ParameterDescription | null)[]
}

// #####################################################
// #                    Command Type                   #
// #####################################################



// Combine into full command list
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

// specific command type
export type ICommand<T extends CommandName> = {
  frame: number
  type: Extract<typeof commands[number], { name: T }>["value"]
  autocontinue: number
  params: CommandParams<T>
}

// generic command type
export type Command = { [K in CommandName]: ICommand<K> }[CommandName]


// some helper types
export type CommandName = typeof commands[number]["name"]
export type CommandValue = typeof commands[number]["value"]



// ####################################################
// #                 Lat Lng Commands                 #
// ####################################################

// commands which contain a lat and lng
export type LatLngCommand = {
  [K in CommandName]:
  "Latitude" extends CommandParamsNames<K>
  ? ("Longitude" extends CommandParamsNames<K> ? ICommand<K> : never)
  : never
}[CommandName]

// commands which contain lat lng and alt
export type LatLngAltCommand = {
  [K in CommandName]:
  "Latitude" extends CommandParamsNames<K>
  ? ("Longitude" extends CommandParamsNames<K> ? ("Altitude" extends CommandParamsNames<K> ? ICommand<K> : never) : never)
  : never
}[CommandName]

/*
 * Filter commands which contain a latitude and longitude
 * @param {Command[]} cmds - list of commands
 * @returns {LatLngCommand[]} commands which contain lat & lng
 */
export function filterLatLngCmds(cmds: Command[]): LatLngCommand[] {
  return cmds.filter((x) => "latitude" in x.params && "longitude" in x.params) as LatLngCommand[]
}

/*
 * Filter commands which contain a latitude, longitude and altitude
 * @param {Command[]} cmds - list of commands
 * @returns {LatLngAltCommand[]} commands which contain lat lng & alt
 */
export function filterLatLngAltCmds(cmds: Command[]): LatLngAltCommand[] {
  return cmds.filter((x) => "latitude" in x.params && "longitude" in x.params && "altitude" in x.params) as LatLngAltCommand[]

}

