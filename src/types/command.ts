type Parameter = {
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

type Command = {
  value: number
  name: string
  description: string
  hasLocation: boolean
  isDestination: boolean
  parameters: (Parameter | null)[]

}
