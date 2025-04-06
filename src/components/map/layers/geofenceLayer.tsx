
import { LayerGroup, Polygon } from "react-leaflet";
import { useWaypoints } from "@/util/context/WaypointContext";
import { toPolyline } from "@/util/waypointToLeaflet";
import DraggableMarker from "@/components/marker/DraggableMarker";
import { filterLatLngCmds } from "@/lib/commands/commands";
import { getLatLng } from "@/util/WPCollection";

const fenceOptions = { color: 'red', fillOpacity: 0.1 }

export default function GeofenceLayer({ onMove }: { onMove: (lat: number, lng: number, id: number) => void }) {
  const { waypoints, activeMission, selectedWPs } = useWaypoints()

  return (
    <LayerGroup>
      {activeMission == "Geofence" ? filterLatLngCmds(waypoints.flatten("Geofence")).map((waypoint, idx) => {
        let active = false
        let x = waypoints.findNthPosition("Geofence", idx)
        if (x) {
          if (x[0] == activeMission && selectedWPs.includes(x[1])) active = true
        }
        return <DraggableMarker key={idx} position={getLatLng(waypoint)} onMove={(lat, lng) => onMove(lat, lng, idx)} active={active} />
      }) : null
      }
      <Polygon pathOptions={fenceOptions} positions={toPolyline(waypoints.flatten("Geofence"))} />
    </LayerGroup>
  )

}
