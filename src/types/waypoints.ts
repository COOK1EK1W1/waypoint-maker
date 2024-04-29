export type Waypoint = {
  frame: number
  type: number

  param1: number
  param2: number
  param3: number
  param4: number
  param5: number
  param6: number
  param7: number

  autocontinue: number
}

export enum CollectionType {
  Mission,
  Overlay,
  Geofence
}

export type WPNode = {
  type:"Collection"
  name: string
  ColType: CollectionType
  collectionID: string
} | {
  type: "Waypoint"
  wps: Waypoint
}

export type WaypointCollection = Map<string, WPNode[]>
