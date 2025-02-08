import { Copter, Plane } from "@/types/vehicleType";

export const defaultPlane: Plane = {
  type: "Plane",
  cruiseAirspeed: 17,
  maxBank: 30,
  energyConstant: 1
}

export const defaultCopter: Copter = {
  type: "Copter",
}
