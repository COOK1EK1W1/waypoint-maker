import { add_waypoint, get_waypoints, insert_waypoint } from "@/util/WPCollection";
import { LayerGroup, Polyline } from "react-leaflet";
import DraggableMarker from "../marker/DraggableMarker";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { toPolyline } from "@/util/waypointToLeaflet";
import InsertBtn from "../marker/insertBtn";

const limeOptions = { color: 'lime' }
const noshow = ["Markers", "Geofence"]

export default function ActiveLayer({onMove}: {onMove: (lat: number, lng: number, id: number)=>void}){
  const {waypoints, activeMission, setWaypoints} = useWaypointContext()
  if (noshow.includes(activeMission)) return null

  const activeWPs = get_waypoints(activeMission, waypoints)

  let insertBtns = []
  for (let i = 0; i < activeWPs.length - 1; i++){
    const midLat = (activeWPs[i].param5 + activeWPs[i+1].param5) / 2
    const midLng = (activeWPs[i].param6 + activeWPs[i+1].param6) / 2
    insertBtns.push(
      <InsertBtn lat={midLat} lng={midLng} onClick={()=>insert(i, midLat, midLng)}/>
    )

  }


  function insert(id: number, lat: number, lng: number){
    const mission = waypoints.get(activeMission)
    if (mission == null) return

    const newMarker = {
      frame: 0,
      type: 16,
      param1: 0,
      param2: 0,
      param3: 0,
      param4: 0,
      param5: lat,
      param6: lng,
      param7: 100,
      autocontinue: 1
    };
    setWaypoints(insert_waypoint(id, activeMission, {type:"Waypoint", wps:newMarker}, waypoints));

  }

  return (
    <LayerGroup>
      {activeWPs.map((waypoint, idx) => 
        <DraggableMarker key={idx} waypoint={waypoint} onMove={(lat, lng)=>onMove(lat, lng, idx)} active={false}/>
      )}
      <Polyline pathOptions={limeOptions} positions={toPolyline(activeWPs)} />
      {insertBtns}
    </LayerGroup>
  )

}
