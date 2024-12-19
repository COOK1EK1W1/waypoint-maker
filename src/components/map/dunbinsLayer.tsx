import { findnthwaypoint, get_waypoints, insert_waypoint } from "@/util/WPCollection";
import { LayerGroup, Polygon, Polyline } from "react-leaflet";
import DraggableMarker from "../marker/DraggableMarker";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { toPolyline } from "@/util/waypointToLeaflet";
import InsertBtn from "../marker/insertBtn";
import { DubinsBetween } from "@/lib/dubins/dubins";
import {Waypoint} from "@/types/waypoints"

const limeOptions = { color: 'lime' }
const noshow = ["Markers", "Geofence"]

export default function DubinsLayer({onMove}: {onMove: (lat: number, lng: number, id: number)=>void}){
  const { waypoints, activeMission} = useWaypointContext()
  if (noshow.includes(activeMission)) return null

  const activeWPs = get_waypoints(activeMission, waypoints)

  if (activeWPs.length <2){
    return
  }

  let a = activeWPs[0]
  let b = activeWPs[1]
  let [R, S, R2]= DubinsBetween({x: a.param6, y: a.param5}, {x: b.param6, y: b.param5}, 0, Math.PI, 400)
  if (R.type != "Curve" || R2.type != "Curve" || S.type != "Straight"){return }
  let rWaypoint: Waypoint = {frame: 0, type: 189, param1: 0, param2: 0, param3: 0, param4: 0, param6: R.center.x, param5: R.center.y, param7: 0, autocontinue: 0}
  let r2Waypoint: Waypoint = {frame: 0, type: 189, param1: 0, param2: 0, param3: 0, param4: 0, param6: R2.center.x, param5: R2.center.y, param7: 0, autocontinue: 0}

  return (
    <LayerGroup>
        <DraggableMarker waypoint={rWaypoint} active={false}/>
        <DraggableMarker waypoint={r2Waypoint} active={false}/>
        <Polygon pathOptions={limeOptions} positions={[{lat: S.start.y, lng: S.start.x}, {lat: S.end.y, lng: S.end.x}]} />
    </LayerGroup>
  )

}
