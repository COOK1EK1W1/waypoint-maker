import { Marker } from "react-leaflet"
import { activeIcon, normalIcon } from "./waypoint"
import { toLatLng } from "@/util/waypointToLeaflet"
import { Waypoint } from "@/types/waypoints"

export default function GeofenceMarker({waypoint, active} : {waypoint :Waypoint, active: boolean}){
  return (
    <Marker
      position={toLatLng(waypoint)}
      icon={active ? activeIcon: normalIcon}>
    </Marker>
  )

}
