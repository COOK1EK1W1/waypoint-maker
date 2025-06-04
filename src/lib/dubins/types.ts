import { XY } from "@/lib/math/types"
import { LatLng } from "../world/latlng"

export type bound = {
  min?: number,
  max?: number,
  circular?: boolean
}

export type dubinsPoint = {
  tunable: boolean,
  pos: XY,
  radius: number,
  bounds: bound,
  heading: number // degrees
  passbyRadius: number
}

export type Curve<S = XY | LatLng> = {
  type: "Curve"
  center: S,
  radius: number,
  start: number, // Radians
  theta: number // Radians
}

export type Straight<S = XY | LatLng> = {
  type: "Straight"
  start: S,
  end: S
}

export type Segment<S = XY | LatLng> = Curve<S> | Straight<S>

export type Path<S = XY | LatLng> = Segment<S>[]
