import { LayerGroup, Polyline } from "react-leaflet";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { Waypoint } from "@/types/waypoints"
import Arc from "../marker/arc";
import { ReactNode } from "react";
import { dubinsBetweenWaypoint, splitDubinsRuns } from "@/lib/dubins/dubinWaypoints";

const curveOptions = { color: '#ff0000' }
const straightOptions = { color: '#bb0000' }
const noshow = ["Markers", "Geofence"]

export default function DubinsLayer() {
  const { waypoints, activeMission } = useWaypointContext()
  if (noshow.includes(activeMission)) return null

  const activeWPs = waypoints.flatten(activeMission)

  if (activeWPs.length < 2) {
    return
  }
  let markers: ReactNode[] = []
  let lines: ReactNode[] = []

  let dubinsSections = splitDubinsRuns(activeWPs)

  let key = 0
  for (let section of dubinsSections) {
    for (let i = 0; i < section.wps.length - 1; i++) {
      let curves = dubinsBetweenWaypoint(section.wps[i], section.wps[i + 1])
      curves.map((c, a) => {
        switch (c.type) {
          case "Curve":
            let rWaypoint: Waypoint = { frame: 0, type: 189, param1: 0, param2: 0, param3: 0, param4: 0, param6: c.center.x, param5: c.center.y, param7: 0, autocontinue: 0 }
            //markers.push(<DraggableMarker key={""+i+a} waypoint={rWaypoint} active={false}/>)
            lines.push(<Arc key={key++} curve={c} pathOptions={curveOptions} />)
            break;
          case "Straight":
            lines.push(<Polyline key={key++} pathOptions={straightOptions} positions={[{ lat: c.start.y, lng: c.start.x }, { lat: c.end.y, lng: c.end.x }]} />)
            break
        }
      })
    }
  }

  return (
    <LayerGroup>
      {markers}
      {lines}
    </LayerGroup>
  )

}
