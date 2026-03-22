import { Copter, Plane } from "./types"

export const defaultPlane: Plane = {
  type: "Plane",
  cruiseAirspeed: 30,
  maxBank: 50,
  energyConstant: 17
}

export const defaultCopter: Copter = {
  type: "Copter",
}
