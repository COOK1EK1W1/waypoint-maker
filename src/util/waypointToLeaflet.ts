import { Waypoint } from "@/types/waypoints"

export function toPolyline(waypoints: (string|Waypoint)[]) {
  const points: {lat: number, lng: number}[] = []
  waypoints.map((waypoint)=>{
    if (typeof waypoint != "string"){
      points.push(toLatLng(waypoint))
    }
  })
  return points
}

export function toLatLng(waypoint: Waypoint) {
  return { lat: waypoint.param5, lng: waypoint.param6 }
}
