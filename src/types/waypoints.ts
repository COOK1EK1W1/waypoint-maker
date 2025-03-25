import { Command } from "@/lib/commands/commands"

export enum CollectionType {
  Mission,
  Overlay,
  Geofence
}

export type WPNode = {
  type: "Command"
  cmd: Command
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

