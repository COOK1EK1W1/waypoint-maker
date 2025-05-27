import { useMemo, useRef } from "react"
import { Marker } from "react-leaflet"
import * as Leaflet from "leaflet"
import { circleOverlayIcon, createAnimatedIcon } from "./waypoint"
import { LatLng } from "@/lib/world/types"

export default function DraggableMarker({ text, position, active, onMove, onClick }: { text?: string, position: LatLng, active: boolean, onMove?: (lat: number, lng: number) => void, onClick?: () => void }) {

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

  const textIcon = useMemo(() => {
    if (!text) return null
    return new Leaflet.DivIcon({
      className: 'text-overlay',
      html: `<div style="display: flex; justify-content: center; align-items: center;">
      <div style="padding-left: 4px; padding-right:4px; font-weight: bold; width: fit-content; background: linear-gradient(0deg,rgba(41, 128, 202, 1) 0%, rgba(70, 151, 208, 1) 100%); text-align: center; color: white; border-radius: 4px; font-size: 12px;">${text}</div>
      </div>`,
      iconSize: [40, 20],
      iconAnchor: [20, 34],
    })
  }, [text])

  return (
    <>
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
        icon={createAnimatedIcon(active)}
      />

      {text && textIcon && (
        <Marker
          position={position}
          icon={textIcon}
          interactive={false}
          zIndexOffset={1000}
        />
      )}

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
