import { LayerGroup, Polyline } from "react-leaflet";
import DraggableMarker from "../marker/DraggableMarker";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { toPolyline } from "@/util/waypointToLeaflet";
import InsertBtn from "../marker/insertBtn";

const limeOptions = { color: 'lime' }
const noshow = ["Markers", "Geofence"]

export default function ActiveLayer({ onMove }: { onMove: (lat: number, lng: number, id: number) => void }) {
  const { setSelectedWPs, setActiveMission, waypoints, activeMission, setWaypoints, selectedWPs } = useWaypointContext()
  if (noshow.includes(activeMission)) return null

  const activeWPs = waypoints.flatten(activeMission)

  let insertBtns = []
  for (let i = 0; i < activeWPs.length - 1; i++) {
    const midLat = (activeWPs[i].param5 + activeWPs[i + 1].param5) / 2
    const midLng = (activeWPs[i].param6 + activeWPs[i + 1].param6) / 2
    insertBtns.push(
      <InsertBtn key={i} lat={midLat} lng={midLng} onClick={() => insert(i, midLat, midLng)} />
    )

  }


  function insert(id: number, lat: number, lng: number) {
    const mission = waypoints.get(activeMission)
    if (mission == null) return

    const newMarker = {
      frame: 3,
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
    setWaypoints((prevWPS) => {
      prevWPS.insert(id + 1, activeMission, { type: "Waypoint", wps: newMarker })
      return prevWPS.clone()
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
      {activeWPs.map((waypoint, idx) => {
        let active = false
        let x = waypoints.findNthPosition(activeMission, idx)
        if (x) {
          if (x[0] == activeMission && selectedWPs.includes(x[1])) active = true
        }
        return <DraggableMarker key={idx} waypoint={{ ...waypoint }} onMove={(lat, lng) => onMove(lat, lng, idx)} active={active} onClick={() => handleMarkerClick(idx)} />
      })
      }
      <Polyline pathOptions={limeOptions} positions={toPolyline(activeWPs)} />
      {insertBtns}
    </LayerGroup>
  )

}
