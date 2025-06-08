import { LayerGroup, Polyline } from "react-leaflet";
import { useWaypoints } from "@/util/context/WaypointContext";
import InsertBtn from "@/components/marker/insertBtn";
import { avgLatLng, getLatLng, LatLng } from "@/lib/world/latlng";
import CommandMarker from "./commandMarker";
import { makeCommand } from "@/lib/commands/default";

const limeOptions = { color: 'lime' }
const noshow = ["Markers", "Geofence"]

export default function ActiveLayer({ onMove }: { onMove: (lat: number, lng: number, id: number) => void }) {
  const { setSelectedWPs, setActiveMission, waypoints, activeMission, setWaypoints, selectedWPs } = useWaypoints()
  if (noshow.includes(activeMission)) return null

  // store each destination in an array, with non destinations in other (to be stacked as they act in the same location)
  const mainLine = waypoints.mainLine(activeMission)

  // create a button between each latlng command
  let insertBtns = []
  for (let i = 0; i < mainLine.length - 1; i++) {
    const avg = avgLatLng([getLatLng(mainLine[i].cmd), getLatLng(mainLine[i + 1].cmd)]) as LatLng
    insertBtns.push(
      <InsertBtn key={i} lat={avg.lat} lng={avg.lng} onClick={() => handleInsert(mainLine[i + 1].id, avg.lat, avg.lng)} />
    )
  }

  // handle insert at specific id
  function handleInsert(id: number, lat: number, lng: number) {
    setWaypoints((prevWPS) => {
      const a = prevWPS.clone()
      a.insert(id, activeMission, { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: lat, longitude: lng }) })
      return a
    });
  }

  // handle when marker is clicked 
  function handleMarkerClick(id: number) {
    const a = waypoints.findNthPosition(activeMission, id)
    if (!a) return
    setActiveMission(a[0])
    setSelectedWPs([a[1]])
  }

  let a = 0;

  return (
    <LayerGroup>
      {mainLine.map((command, _) => {
        const position = getLatLng(command.cmd);
        const isActive = (() => {
          const x = waypoints.findNthPosition(activeMission, command.id);
          return x?.[0] === activeMission && selectedWPs.includes(x[1]);
        })();


        return (
          <CommandMarker
            command={command}
            key={a++}
            basePosition={position}
            onMove={onMove}
            active={isActive}
            onClick={handleMarkerClick}
          />
        );
      })}

      <Polyline pathOptions={limeOptions} positions={mainLine.map(x => getLatLng(x.cmd))} />
      {insertBtns}
    </LayerGroup>
  )

}
