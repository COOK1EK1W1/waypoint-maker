import { LayerGroup } from "react-leaflet";
import { useWaypoints } from "@/util/context/WaypointContext";
import DraggableMarker from "@/components/marker/DraggableMarker";
import GeofenceMarker from "@/components/marker/geofenceMarker";
import { toLatLng } from "@/util/waypointToLeaflet";


export default function MarkerLayer({ onMove }: { onMove: (lat: number, lng: number, id: number) => void }) {
  const { waypoints, activeMission, selectedWPs } = useWaypoints()

  return (
    <LayerGroup>
      {waypoints.flatten("Markers").map((waypoint, idx) => {
        let active = false
        let x = waypoints.findNthPosition("Geofence", idx)
        if (x) {
          if (x[0] == activeMission && selectedWPs.includes(x[1])) active = true
        }
        if (activeMission == "Markers") {
          return <DraggableMarker key={idx} position={toLatLng(waypoint)} onMove={(lat, lng) => onMove(lat, lng, idx)} active={false} />
        } else {
          return <GeofenceMarker key={idx} position={toLatLng(waypoint)} active={false} />

        }
      })
      }
    </LayerGroup>
  )

}
