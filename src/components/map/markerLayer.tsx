import { get_waypoints } from "@/util/WPCollection";
import { LayerGroup } from "react-leaflet";
import DraggableMarker from "../marker/DraggableMarker";
import { useWaypointContext } from "@/util/context/WaypointContext";
import GeofenceMarker from "../marker/geofenceMarker";


export default function MarkerLayer({onMove}: {onMove: (lat: number, lng: number, id: number)=>void}){
  const {waypoints, activeMission} = useWaypointContext()

  return (
    <LayerGroup>
      {get_waypoints("Markers", waypoints).map((waypoint, idx) => {
        if (activeMission == "Markers"){
          return <DraggableMarker key={idx} waypoint={waypoint} onMove={(lat, lng)=>onMove(lat, lng, idx)} active={false}/>
        }else{
          return <GeofenceMarker key={idx} waypoint={waypoint} active={false}/>

        }

      }
      )}
    </LayerGroup>
  )

}
