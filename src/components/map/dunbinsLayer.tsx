import { LayerGroup, Polyline } from "react-leaflet";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { Waypoint } from "@/types/waypoints"
import Arc from "../marker/arc";
import { ReactNode } from "react";
import { dubinsBetweenDubins, localisePath, splitDubinsRuns, waypointToDubins } from "@/lib/dubins/dubinWaypoints";
import DraggableMarker from "../marker/DraggableMarker";

const curveOptions = { color: '#ff0000' }
const straightOptions = { color: '#bb0000' }
const noshow = ["Markers", "Geofence"]

export default function DubinsLayer() {
  const { waypoints, activeMission } = useWaypointContext()
  if (noshow.includes(activeMission)) return null

  // get reference waypoint
  const reference = waypoints.getReferencePoint()

  const activeWPs = waypoints.flatten(activeMission)

  if (activeWPs.length < 2) {
    return
  }
  let markers: ReactNode[] = []
  let lines: ReactNode[] = []

  let dubinsSections = splitDubinsRuns(activeWPs)
  for (const section of dubinsSections) {
    let dubinsPoints = section.wps.map((x) => waypointToDubins(x, reference))
    let path = dubinsBetweenDubins(dubinsPoints)
    const worldPath = localisePath(path, reference)
    let key = 0
    worldPath.map((c, a) => {
      switch (c.type) {
        case "Curve":
          let rWaypoint: Waypoint = { frame: 0, type: 189, param1: 0, param2: 0, param3: 0, param4: 0, param6: c.center.lat, param5: c.center.lng, param7: 0, autocontinue: 0 }
          //markers.push(<DraggableMarker key={"" + i + a} waypoint={rWaypoint} active={false} />)
          lines.push(<Arc key={key++} curve={c} pathOptions={curveOptions} />)
          break;
        case "Straight":
          lines.push(<Polyline key={key++} pathOptions={straightOptions} positions={[c.start, c.end]} />)
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
