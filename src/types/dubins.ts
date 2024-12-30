export type XY = {
  x: number,
  y: number
}

export type Curve = {
  type: "Curve"
  center: XY,
  radius: number,
  start: number,
  theta: number
}

export type Straight = {
  type: "Straight"
  start: XY,
  end: XY
}

export type Segment = Curve | Straight

export type Path = Segment[]

export type bound = {
  min?: number,
  max?: number,
  circular?: boolean
}
