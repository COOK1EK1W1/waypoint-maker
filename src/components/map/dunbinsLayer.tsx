import { get_waypoints } from "@/util/WPCollection";
import { LayerGroup, Polyline } from "react-leaflet";
import DraggableMarker from "../marker/DraggableMarker";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { DubinsBetween } from "@/lib/dubins/dubins";
import {Waypoint} from "@/types/waypoints"
import Arc from "../marker/arc";
import { ReactNode } from "react";
import { pathLength } from "@/lib/dubins/geometry";
import { particleSwarmOptimise } from "@/lib/optimisation/particleSwarm";

const limeOptions = { color: 'red' }
const noshow = ["Markers", "Geofence"]

export default function DubinsLayer(){
  const { waypoints, activeMission} = useWaypointContext()
  if (noshow.includes(activeMission)) return null

  const activeWPs = get_waypoints(activeMission, waypoints)

  if (activeWPs.length <2){
    return
  }
  let markers: ReactNode[] = []
  let lines: ReactNode[] = []

  function testing(dirs: number[]): number{
    let totalLength = 0

    for (let i = 0; i < activeWPs.length - 1; i++){
      let a = activeWPs[i]
      let b = activeWPs[i+1]
      let h1 = dirs[i]
      let h2 = dirs[i+1]
      let curves = DubinsBetween({x: a.param6, y: a.param5}, {x: b.param6, y: b.param5}, h1, h2, b.param3)
      totalLength += pathLength(curves)
    }
    return totalLength
  }
  let start_dirs = []
  for (let u = 0; u < activeWPs.length; u++){
    start_dirs.push(0)
  }
  let optimised_dirs = particleSwarmOptimise(start_dirs, [], testing, 200)

  for (let i = 0; i < activeWPs.length - 1; i ++){
    let a = activeWPs[i]
    let b = activeWPs[i+1]
    let h1 = optimised_dirs[i]
    let h2 = optimised_dirs[i+1]
    let curves = DubinsBetween({x: a.param6, y: a.param5}, {x: b.param6, y: b.param5}, h1, h2, b.param3)
    curves.map((c, a) =>{
      switch (c.type){
        case "Curve":
          let rWaypoint: Waypoint = {frame: 0, type: 189, param1: 0, param2: 0, param3: 0, param4: 0, param6: c.center.x, param5: c.center.y, param7: 0, autocontinue: 0}
          markers.push(<DraggableMarker key={""+i+a} waypoint={rWaypoint} active={false}/>)
          lines.push(<Arc key={""+i+a} curve={c} pathOptions={limeOptions}/>)
          break;
        case "Straight":
          lines.push(<Polyline key={""+i+a} pathOptions={limeOptions} positions={[{lat: c.start.y, lng: c.start.x}, {lat: c.end.y, lng: c.end.x}]} />)
          break
      }

    })


  }
  return (
    <LayerGroup>
      {markers}
      {lines}
    </LayerGroup>
  )

}
