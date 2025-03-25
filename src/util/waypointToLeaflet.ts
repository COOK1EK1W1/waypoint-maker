import { Command } from "@/lib/commands/commands"
import { LatLng } from "@/lib/world/types"

export function toPolyline(waypoints: Command[]) {
  const points: { lat: number, lng: number }[] = []
  waypoints.map((waypoint) => {
    if (typeof waypoint != "string") {
      points.push(toLatLng(waypoint))
    }
  })
  return points
}

export function toLatLng(waypoint: Command): LatLng {
  return { lat: waypoint.param5, lng: waypoint.param6 }
}
