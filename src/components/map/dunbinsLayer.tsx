import { get_waypoints } from "@/util/WPCollection";
import { LayerGroup, Polyline } from "react-leaflet";
import DraggableMarker from "../marker/DraggableMarker";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { DubinsBetween } from "@/lib/dubins/dubins";
import {Waypoint} from "@/types/waypoints"
import Arc from "../marker/arc";
import { ReactNode } from "react";
import { pathLength, worldBearing, worldPathLength } from "@/lib/dubins/geometry";
import { particleSwarmOptimise } from "@/lib/optimisation/particleSwarm";
import { angleBetweenPoints } from "@/util/distance";

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
      totalLength += worldPathLength(curves)
    }
    return totalLength
  }
  let start_dirs = [0]
  for (let u = 1; u < activeWPs.length - 1; u++){
    let wp1 = activeWPs[u - 1]
    let wp2 = activeWPs[u]
    let wp3 = activeWPs[u + 1]
    let a = worldBearing({x: wp1.param6, y: wp1.param5}, {x: wp2.param6, y: wp2.param5})
    let b = worldBearing({x: wp2.param6, y: wp2.param5}, {x: wp3.param6, y: wp3.param5})
    if (Math.abs(a - b) > Math.PI){
      start_dirs.push((a+b)/2 + Math.PI)
    }else{
      start_dirs.push((a+b)/2)
    }
  }
  start_dirs.push(0)
  let optimised_dirs = particleSwarmOptimise(start_dirs, [], testing, 100)
  //let optimised_dirs = start_dirs
  console.log(optimised_dirs)

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
