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
  type: "Waypoint"
  wps: Waypoint
}

export type ColNode = {
  type: "Collection"
  name: string
  ColType: CollectionType
  collectionID: string
  offsetLat: number
  offsetLng: number

}

export type Node = WPNode | ColNode

export type WaypointCollection3 = Map<string, Node[]>


export enum Severity {
  Good,
  Med,
  Bad,
}

export type Fault = {
  offenderMission?: string,
  offenderIndex?: number,
  message: string,
  severity: Severity

}

