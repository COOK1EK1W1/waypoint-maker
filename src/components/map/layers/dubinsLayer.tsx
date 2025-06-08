import { Circle, LayerGroup, Polyline } from "react-leaflet";
import { useWaypoints } from "@/util/context/WaypointContext";
import { ReactNode } from "react";
import { dubinsBetweenDubins, localisePath, splitDubinsRuns, waypointToDubins } from "@/lib/dubins/dubinWaypoints";
import Arc from "@/components/marker/arc";
import { Command } from "@/lib/commands/commands";
import { getLatLng } from "@/lib/world/latlng";

const curveOptions = { color: '#ff0000' }
const straightOptions = { color: '#bb0000' }
const noshow = ["Markers", "Geofence"]

export default function DubinsLayer() {
  const { waypoints, activeMission } = useWaypoints()
  if (noshow.includes(activeMission)) return null

  // get reference waypoint
  const reference = waypoints.getReferencePoint()

  const activeWPs = waypoints.flatten(activeMission)
  const mainLine = waypoints.mainLine(activeMission)

  if (activeWPs.length < 2) {
    return
  }
  let markers: ReactNode[] = []
  let lines: ReactNode[] = []
  let passByCircles: ReactNode[] = []

  let key = 0
  let dubinsSections = splitDubinsRuns(mainLine)
  for (const section of dubinsSections) {
    section.run.map((x, i) => {
      if (i != 0 && x.cmd.type == 69 && i < section.run.length - 1 && x.cmd.params["fly-by distance"] > 0)
        passByCircles.push(<Circle center={getLatLng(x.cmd)} radius={x.cmd.params["fly-by distance"]} key={key++} />)
    })
    let dubinsPoints = section.run.map((x) => waypointToDubins(x.cmd, reference))
    let path = dubinsBetweenDubins(dubinsPoints)
    const worldPath = localisePath(path, reference)
    worldPath.map((c, _) => {
      switch (c.type) {
        case "Curve":
          let rWaypoint: Command = { frame: 3, type: 189, params: { latitude: c.center.lat, longitude: c.center.lng, altitude: 0 }, autocontinue: 0 }
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
      {passByCircles}
    </LayerGroup>
  )

}
