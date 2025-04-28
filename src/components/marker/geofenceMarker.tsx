import { Marker } from "react-leaflet"
import { LatLng } from "@/lib/world/types"
import { createAnimatedIcon } from "./waypoint"

export default function GeofenceMarker({ position, active }: { position: LatLng, active: boolean }) {
  return (
    <Marker
      position={position}
      icon={createAnimatedIcon(active)}>
    </Marker>
  )

}
