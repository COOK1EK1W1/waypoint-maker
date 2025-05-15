import { LayerGroup, Polyline } from "react-leaflet";
import { useWaypoints } from "@/util/context/WaypointContext";
import InsertBtn from "@/components/marker/insertBtn";
import DraggableMarker from "@/components/marker/DraggableMarker";
import { Command, getCommandDesc, LatLngCommand } from "@/lib/commands/commands";
import { defaultWaypoint } from "@/lib/mission/defaults";
import { avgLatLng, getLatLng } from "@/lib/world/latlng";
import NonDestChip from "@/components/marker/nonDestChip";
import { commandName } from "@/util/translationTable";
import { LatLng } from "@/lib/world/types";

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
      a.insert(id, activeMission, { type: "Command", cmd: defaultWaypoint({ lat, lng }) })
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
      {mainLine.map((command, idx) => {
        const position = getLatLng(command.cmd);
        const isActive = (() => {
          const x = waypoints.findNthPosition(activeMission, command.id);
          return x?.[0] === activeMission && selectedWPs.includes(x[1]);
        })();

        return (
          <div key={a++}>
            <DraggableMarker
              position={position}
              onMove={(lat, lng) => onMove(lat, lng, command.id)}
              active={isActive}
              onClick={() => handleMarkerClick(command.id)}
            />
          </div>
        );
      })}

      {mainLine.map((command) => {
        const position = getLatLng(command.cmd);
        return command.other.map((cmd, id) => {
          const isActive = (() => {
            const x = waypoints.findNthPosition(activeMission, command.id + 1 + id);
            return x?.[0] === activeMission && selectedWPs.includes(x[1]);
          })();

          return (
            <NonDestChip
              key={a++}
              name={commandName(getCommandDesc(cmd.type).name)}
              offset={id}
              position={position}
              active={isActive}
              onClick={() => handleMarkerClick(command.id + id + 1)}
            />
          );
        });
      })}

      <Polyline pathOptions={limeOptions} positions={mainLine.map(x => getLatLng(x.cmd))} />
      {insertBtns}
    </LayerGroup>
  )

}
