import { useMemo } from "react";
import { Marker } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import { insertIcon } from "./waypoint";

export default function InsertBtn({ lat, lng, onClick }: { lat: number, lng: number, onClick: () => void }) {

  const eventHandlers = useMemo(
    () => ({
      click(e: LeafletMouseEvent) {
        e.originalEvent.preventDefault()
        onClick()
      }
    }),
    [onClick],
  )

  return <Marker
    eventHandlers={eventHandlers}
    position={[lat, lng]}
    icon={insertIcon}
  />
}
