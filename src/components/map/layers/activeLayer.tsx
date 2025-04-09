import { LayerGroup, Polyline } from "react-leaflet";
import { useWaypoints } from "@/util/context/WaypointContext";
import { toPolyline } from "@/util/waypointToLeaflet";
import InsertBtn from "@/components/marker/insertBtn";
import DraggableMarker from "@/components/marker/DraggableMarker";
import { filterLatLngCmds } from "@/lib/commands/commands";
import { defaultWaypoint } from "@/lib/mission/defaults";
import { getLatLng } from "@/util/WPCollection";

const limeOptions = { color: 'lime' }
const noshow = ["Markers", "Geofence"]

export default function ActiveLayer({ onMove }: { onMove: (lat: number, lng: number, id: number) => void }) {
  const { setSelectedWPs, setActiveMission, waypoints, activeMission, setWaypoints, selectedWPs } = useWaypoints()
  if (noshow.includes(activeMission)) return null

  const activeWPs = filterLatLngCmds(waypoints.flatten(activeMission))

  let insertBtns = []
  for (let i = 0; i < activeWPs.length - 1; i++) {
    const midLat = (activeWPs[i].params.latitude + activeWPs[i + 1].params.latitude) / 2
    const midLng = (activeWPs[i].params.longitude + activeWPs[i + 1].params.longitude) / 2
    insertBtns.push(
      <InsertBtn key={i} lat={midLat} lng={midLng} onClick={() => insert(i, midLat, midLng)} />
    )

  }

  function insert(id: number, lat: number, lng: number) {
    setWaypoints((prevWPS) => {
      const a = prevWPS.clone()
      a.insert(id + 1, activeMission, { type: "Command", cmd: defaultWaypoint({ lat, lng }) })
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
      {activeWPs.map((command, idx) => {
        let active = false
        let x = waypoints.findNthPosition(activeMission, idx)
        if (x) {
          if (x[0] == activeMission && selectedWPs.includes(x[1])) active = true
        }
        return <DraggableMarker key={idx} position={getLatLng(command)} onMove={(lat, lng) => onMove(lat, lng, idx)} active={active} onClick={() => handleMarkerClick(idx)} />
      })
      }
      <Polyline pathOptions={limeOptions} positions={toPolyline(activeWPs)} />
      {insertBtns}
    </LayerGroup>
  )

}
