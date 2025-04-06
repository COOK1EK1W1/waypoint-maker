import { mavCmds } from "./mav/commands"

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
