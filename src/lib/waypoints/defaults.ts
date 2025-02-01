export const defaultWaypoint = (lat: number, lng: number,) => ({
  frame: 3,
  type: 16,
  param1: 0,
  param2: 0,
  param3: 0,
  param4: 0,
  param5: lat,
  param6: lng,
  param7: 100,
  autocontinue: 1
})


export const defaultTakeoff = (lat: number, lng: number,) => ({
  frame: 3,
  type: 22,
  param1: 15,
  param2: 0,
  param3: 0,
  param4: 0,
  param5: lat,
  param6: lng,
  param7: 15,
  autocontinue: 1
})

