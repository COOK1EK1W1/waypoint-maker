import { useMemo, useRef } from "react"
import { Marker } from "react-leaflet"
import * as Leaflet from "leaflet"
import { activeIcon, normalIcon } from "./waypoint"
import { toLatLng } from "@/util/waypointToLeaflet"
import {Waypoint} from "@/types/waypoints"

export default function DraggableMarker({waypoint, active, onMove, onClick} : {waypoint :Waypoint, active: boolean, onMove?: (lat:number, lng:number)=>void, onClick?: ()=>void}) {

  const markerRef = useRef<Leaflet.Marker>(null)

  const eventHandlers = useMemo(
    () => ({
      click(){
        if (onClick) onClick()
      },
      drag() {
        const marker = markerRef.current
        if (marker != null) {
          const newLocation = marker.getLatLng()
          if (onMove){
            onMove(newLocation.lat, newLocation.lng)
          }
        }
      },
    }),
    [onMove, onClick],
  )

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={toLatLng(waypoint)}
      ref={markerRef}
      icon={active ? activeIcon: normalIcon}
    >
    </Marker>
  )
}
