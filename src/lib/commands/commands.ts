import { LatLng } from "leaflet";
import { makeCommand } from "./default";
import { mavCmds } from "./mav/commands";
import { wpmCmds } from "./wpm/commands";
import { Simplify } from "@/types/tools";


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

export const altFrame = {
  "global": 0,
  "mission": 2,
  "relative": 3,
  "terrain": 10
} as const


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
  frame: "Altitude" extends CommandParamsNames<T> ? Exclude<typeof altFrame[keyof typeof altFrame], typeof altFrame["mission"]> : 2
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

// commands which have altitude
export type AltCommand = {
  [K in CommandName]:
  "Altitude" extends CommandParamsNames<K> ? ICommand<K> : never
}[CommandName]

/*
 * Filter commands which contain a latitude and longitude
 * @param {Command[]} cmds - list of commands
 * @returns {LatLngCommand[]} commands which contain lat & lng
 */
export function filterLatLngCmds<T extends Command>(cmds: T[]): Extract<T, LatLngCommand>[] {
  return cmds.filter((x): x is Extract<T, LatLngCommand> => "latitude" in x.params && "longitude" in x.params)
}

/*
 * Filter commands which contain an altitude
 * @param {Command[]} cmds - list of commands
 * @returns {LatLngAltCommand[]} commands which contain alt
 */
export function filterAltCmds<T extends Command>(cmds: T[]): Extract<T, AltCommand>[] {
  return cmds.filter((x): x is Extract<T, AltCommand> => "altitude" in x.params)
}

/*
 * Filter commands which contain a latitude, longitude and altitude
 * @param {Command[]} cmds - list of commands
 * @returns {LatLngAltCommand[]} commands which contain lat lng & alt
 */
export function filterLatLngAltCmds<T extends Command>(cmds: T[]): Extract<T, LatLngAltCommand>[] {
  return cmds.filter((x): x is Extract<T, LatLngAltCommand> => "latitude" in x.params && "longitude" in x.params && "altitude" in x.params)
}

/*
 * Type safely find a command description
 * @param {CommandValue} cmdId - The command id to find 
 * @returns {CommandDescription} - The command description
 */
export function getCommandDesc(cmdId: CommandValue): (typeof commands)[number] {
  return commands.find(x => x.value == cmdId) as (typeof commands)[number]
}
