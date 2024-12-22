export type Copter = {
  type: "Copter"

}

export type Plane = {
  type: "Plane"
  cruiseAirspeed: number
  maxBank: number
}

export type Vehicle = Copter | Plane
