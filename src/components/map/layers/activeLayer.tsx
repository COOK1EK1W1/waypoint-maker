import { LayerGroup, Polyline } from "react-leaflet";
import { useWaypoints } from "@/util/context/WaypointContext";
import InsertBtn from "@/components/marker/insertBtn";
import DraggableMarker from "@/components/marker/DraggableMarker";
import { Command, getCommandDesc, LatLngCommand } from "@/lib/commands/commands";
import { defaultWaypoint } from "@/lib/mission/defaults";
import { getLatLng } from "@/lib/world/latlng";

const limeOptions = { color: 'lime' }
const noshow = ["Markers", "Geofence"]

export default function ActiveLayer({ onMove }: { onMove: (lat: number, lng: number, id: number) => void }) {
  const { setSelectedWPs, setActiveMission, waypoints, activeMission, setWaypoints, selectedWPs } = useWaypoints()
  if (noshow.includes(activeMission)) return null

  const commands = waypoints.flatten(activeMission)

  // store each destination in an array, with non destinations in other (to be stacked as they act in the same location)
  const mainLine: { cmd: LatLngCommand, id: number, other: Command[] }[] = []

  commands.forEach((cmd, id) => {
    const desc = getCommandDesc(cmd.type)
    if (desc.isDestination && "latitude" in cmd.params && "longitude" in cmd.params) {
      // @ts-ignore
      mainLine.push({ cmd, id, other: [] })
    } else {
      if (mainLine.length !== 0) {
        mainLine[mainLine.length - 1].other.push(cmd)
      }
    }
  })

  let insertBtns = []
  for (let i = 0; i < mainLine.length - 1; i++) {
    const midLat = (mainLine[i].cmd.params.latitude + mainLine[i + 1].cmd.params.latitude) / 2
    const midLng = (mainLine[i].cmd.params.longitude + mainLine[i + 1].cmd.params.longitude) / 2
    insertBtns.push(
      <InsertBtn key={i} lat={midLat} lng={midLng} onClick={() => insert(mainLine[i + 1].id, midLat, midLng)} />
    )
  }

  function insert(id: number, lat: number, lng: number) {
    setWaypoints((prevWPS) => {
      const a = prevWPS.clone()
      a.insert(id, activeMission, { type: "Command", cmd: defaultWaypoint({ lat, lng }) })
      return a
    });
  }

  function handleMarkerClick(id: number) {
    const a = waypoints.findNthPosition(activeMission, id)
    if (!a) return
    setActiveMission(a[0])
    setSelectedWPs([a[1]])
  }

  return (
    <LayerGroup>
      {mainLine.map((command, idx) => {
        let active = false
        let x = waypoints.findNthPosition(activeMission, command.id)
        if (x) {
          if (x[0] == activeMission && selectedWPs.includes(x[1])) active = true
        }
        return <DraggableMarker key={idx} position={getLatLng(command.cmd)} onMove={(lat, lng) => onMove(lat, lng, command.id)} active={active} onClick={() => handleMarkerClick(command.id)} />
      })
      }
      <Polyline pathOptions={limeOptions} positions={mainLine.map(x => getLatLng(x.cmd))} />
      {insertBtns}
    </LayerGroup>
  )

}
