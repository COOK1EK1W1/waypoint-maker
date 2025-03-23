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
