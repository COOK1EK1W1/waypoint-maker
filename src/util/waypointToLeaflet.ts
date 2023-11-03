export function toPolyline(waypoints: Waypoint[]) {
  return waypoints.map((waypoint) => toLatLng(waypoint))
}

export function toLatLng(waypoint: Waypoint) {
  return { lat: waypoint.param5, lng: waypoint.param6 }
}