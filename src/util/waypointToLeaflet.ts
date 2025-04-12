import { Command, filterLatLngCmds } from "@/lib/commands/commands"
import { getLatLng } from "@/lib/world/latlng"

export function toPolyline(waypoints: Command[]) {
  const points: { lat: number, lng: number }[] = []
  const a = filterLatLngCmds(waypoints)
  a.map((waypoint) => {
    if (typeof waypoint != "string") {
      points.push(getLatLng(waypoint))
    }
  })
  return points
}
