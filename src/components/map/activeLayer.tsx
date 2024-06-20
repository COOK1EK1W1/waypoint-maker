import { get_waypoints } from "@/util/WPCollection";
import { LayerGroup, Polyline } from "react-leaflet";
import DraggableMarker from "../marker/DraggableMarker";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { toPolyline } from "@/util/waypointToLeaflet";

const limeOptions = { color: 'lime' }
const noshow = ["Markers", "Geofence"]

export default function ActiveLayer({onMove}: {onMove: (lat: number, lng: number, id: number)=>void}){
  const {waypoints, activeMission} = useWaypointContext()
  if (noshow.includes(activeMission)) return null

  return (
    <LayerGroup>
      {get_waypoints(activeMission, waypoints).map((waypoint, idx) => 
        <DraggableMarker key={idx} waypoint={waypoint} onMove={(lat, lng)=>onMove(lat, lng, idx)} active={false}/>
      )}
      <Polyline pathOptions={limeOptions} positions={toPolyline(get_waypoints(activeMission, waypoints))} />
    </LayerGroup>
  )

}
