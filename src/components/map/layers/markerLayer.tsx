import { LayerGroup } from "react-leaflet";
import { useWaypoints } from "@/util/context/WaypointContext";
import DraggableMarker from "@/components/marker/DraggableMarker";
import GeofenceMarker from "@/components/marker/geofenceMarker";
import { filterLatLngCmds } from "@/lib/commands/commands";
import { getLatLng } from "@/lib/world/latlng";
import { useMap } from "@/util/context/MapContext";


export default function MarkerLayer({ onMove }: { onMove: (lat: number, lng: number, id: number) => void }) {
  const { waypoints, activeMission, selectedWPs } = useWaypoints()
  const { viewable } = useMap()

  // check if they are visible
  if (!viewable["markers"] && activeMission !== "Markers") return null

  return (
    <LayerGroup>
      {filterLatLngCmds(waypoints.flatten("Markers")).map((waypoint, idx) => {
        let active = false
        let x = waypoints.findNthPosition("Markers", idx)

        if (x && x[0] == activeMission && selectedWPs.includes(x[1])) {
          active = true
        }

        if (activeMission == "Markers") {
          return <DraggableMarker key={idx} position={getLatLng(waypoint)} onMove={(lat, lng) => onMove(lat, lng, idx)} active={false} />
        } else {
          return <GeofenceMarker key={idx} position={getLatLng(waypoint)} active={false} />

        }
      })
      }
    </LayerGroup>
  )

}
