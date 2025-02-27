import { LatLng } from "@/types/dubins"

export const defaultWaypoint = (pos: LatLng) => ({
  frame: 3,
  type: 16,
  param1: 0,
  param2: 0,
  param3: 0,
  param4: 0,
  param5: pos.lat,
  param6: pos.lng,
  param7: 100,
  autocontinue: 1
})


export const defaultTakeoff = (pos: LatLng) => ({
  frame: 3,
  type: 22,
  param1: 15,
  param2: 0,
  param3: 0,
  param4: 0,
  param5: pos.lat,
  param6: pos.lng,
  param7: 15,
  autocontinue: 1
})

export const defaultDoLandStart = (pos: LatLng) => ({
  frame: 0,
  type: 189,
  param1: 0,
  param2: 0,
  param3: 0,
  param4: 0,
  param5: pos.lat,
  param6: pos.lng,
  param7: 0,
  autocontinue: 0
})
