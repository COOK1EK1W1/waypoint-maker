import { ICommand } from "../commands/commands"
import { LatLng } from "../world/latlng"

export const defaultWaypoint = (pos: LatLng): ICommand<"MAV_CMD_NAV_WAYPOINT"> => ({
  frame: 3,
  type: 16,
  params: {
    "accept radius": 0,
    yaw: 0,
    hold: 0,
    "pass radius": 0,
    latitude: pos.lat,
    longitude: pos.lng,
    altitude: 100
  },
  autocontinue: 1
})


export const defaultTakeoff = (pos: LatLng): ICommand<"MAV_CMD_NAV_TAKEOFF"> => ({
  frame: 3,
  type: 22,
  params: {
    yaw: 0,
    pitch: 15,
    latitude: pos.lat,
    longitude: pos.lng,
    altitude: 15
  },
  autocontinue: 1
})

export const defaultDoLandStart = (pos: LatLng): ICommand<"MAV_CMD_DO_LAND_START"> => ({
  frame: 0,
  type: 189,
  params: {
    latitude: pos.lat,
    longitude: pos.lng,
    altitude: 100,
  },
  autocontinue: 0
})
