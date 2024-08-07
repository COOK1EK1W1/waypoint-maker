
import { findnthwaypoint, get_waypoints } from "@/util/WPCollection";
import { LayerGroup, Polygon } from "react-leaflet";
import DraggableMarker from "../marker/DraggableMarker";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { toPolyline } from "@/util/waypointToLeaflet";

const fenceOptions = { color: 'red', fillOpacity: 0.1 }

export default function GeofenceLayer({onMove}: {onMove: (lat: number, lng: number, id: number)=>void}){
  const {waypoints, activeMission, selectedWPs} = useWaypointContext()

  return (
    <LayerGroup>
      {activeMission == "Geofence" ? get_waypoints("Geofence", waypoints).map((waypoint, idx) => {
        let active = false
        let x = findnthwaypoint("Geofence", idx, waypoints)
        if (x){
          if (x[0] == activeMission && selectedWPs.includes(x[1])) active = true
        }
        return <DraggableMarker key={idx} waypoint={waypoint} onMove={(lat, lng)=>onMove(lat, lng, idx)} active={active}/>
      }):null
      }
      <Polygon pathOptions={fenceOptions} positions={toPolyline(get_waypoints("Geofence", waypoints))} />
    </LayerGroup>
  )

}
