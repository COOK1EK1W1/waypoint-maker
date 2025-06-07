import { Marker } from "react-leaflet"
import { createAnimatedIcon } from "./waypoint"
import { useMemo } from "react"
import * as Leaflet from "leaflet"
import { LatLng } from "@/lib/world/latlng"

export default function GeofenceMarker({ text, position, active }: { position: LatLng, active: boolean, text?: string }) {

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
        position={position}
        icon={createAnimatedIcon(active)}>
      </Marker>

      {text && textIcon && (
        <Marker
          position={position}
          icon={textIcon}
          interactive={false}
          zIndexOffset={1000}
        />
      )}

    </>
  )

}
