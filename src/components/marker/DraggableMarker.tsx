import { useMemo, useRef } from "react"
import { Marker } from "react-leaflet"
import * as Leaflet from "leaflet"
import { circleOverlayIcon, createAnimatedIcon } from "./waypoint"
import { LatLng } from "@/lib/world/types"

export default function DraggableMarker({ position, active, onMove, onClick }: { position: LatLng, active: boolean, onMove?: (lat: number, lng: number) => void, onClick?: () => void }) {

  const markerRef = useRef<Leaflet.Marker>(null)

  const eventHandlers = useMemo(
    () => ({
      click() {
        if (onClick) onClick()
      },
      drag() {
        const marker = markerRef.current
        if (marker != null) {
          const newLocation = marker.getLatLng()
          if (onMove) {
            onMove(newLocation.lat, newLocation.lng)
          }
        }
      },
    }),
    [onMove, onClick],
  )

  return (
    <>
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
        icon={createAnimatedIcon(active)}
      />
      {active ? <Marker
        position={position}
        interactive={false}
        icon={circleOverlayIcon}
        zIndexOffset={-1000}
      />
        : null}
    </>
  )
}
