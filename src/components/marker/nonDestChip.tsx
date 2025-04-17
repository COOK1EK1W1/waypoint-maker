import { useMemo, useRef } from "react"
import { Marker } from "react-leaflet"
import * as Leaflet from "leaflet"
import { circleOverlayIcon, createAnimatedIcon } from "./waypoint"
import { LatLng } from "@/lib/world/types"

export default function NonDestChip({ name, position, active, onClick, offset }: { name: string, position: LatLng, offset: number, active: boolean, onClick?: () => void }) {

  const markerRef = useRef<Leaflet.Marker>(null)

  const eventHandlers = useMemo(
    () => ({
      click() {
        if (onClick) onClick()
      },
    }),
    [onClick],
  )

  return (
    <>
      <Marker
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
        icon={Leaflet.divIcon({
          className: '',
          iconSize: [25, 25],
          iconAnchor: [12, 41 + (offset + 1) * 30],
          html: `
      <div style="
        transform: scale(${active ? 1.2 : 1});
        width: 25px;
        height: 25px;
        border-radius: 100%;
        background-color: oklch(90.1% 0.076 70.697);
        border-color: oklch(83.7% 0.128 66.29);
        border-width: 2px;
        position: relative;
        z-index: 10;
        text-align: center;
      ">${name.split(" ").map(x => x[0]).splice(1).join("")}</div>
    `,
        })}

      />
      {
        active ? <Marker
          position={position}
          interactive={false}
          icon={Leaflet.divIcon({
            className: "",
            iconSize: [25, 25],
            iconAnchor: [12.5, 41 + (offset + 1) * 30],
            html: `<div class="animate-ping w-[25px] h-[25px] border-2 rounded-full"></div>`
          })
          }
          zIndexOffset={- 1000}
        />
          : null}
    </>
  )
}
