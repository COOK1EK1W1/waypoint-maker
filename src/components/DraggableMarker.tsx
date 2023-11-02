import { useMemo, useRef } from "react"
import { Marker } from "react-leaflet"
import * as Leaflet from "leaflet"
import { useWaypointContext } from "./WaypointContext"
import { activeIcon, normalIcon } from "./waypoint"

export default function DraggableMarker({id} : {id :number}) {
  const {active, waypoints, setWaypoints} = useWaypointContext()
  const markerRef = useRef<Leaflet.Marker>(null)

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          setWaypoints((prevWaypoints) =>{
            
            const newLocation = marker.getLatLng()
            const newWaypoints = [...prevWaypoints]
            newWaypoints[id] = {
              ...newWaypoints[id],
              lat: newLocation.lat,
              lng: newLocation.lng
            }
            
            return newWaypoints
          })
        }
      },
    }),
    [],
  )

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={waypoints[id]}
      ref={markerRef}
      icon={active == id ? activeIcon: normalIcon}>
    </Marker>
  )
}