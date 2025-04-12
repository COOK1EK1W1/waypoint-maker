import { Marker } from "react-leaflet"
import { activeIcon, normalIcon } from "./waypoint"
import { LatLng } from "@/lib/world/types"

export default function GeofenceMarker({ position, active }: { position: LatLng, active: boolean }) {
  return (
    <Marker
      position={position}
      icon={active ? activeIcon : normalIcon}>
    </Marker>
  )

}
