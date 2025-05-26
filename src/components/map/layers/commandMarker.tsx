import DraggableMarker from "@/components/marker/DraggableMarker"
import NonDestChip from "@/components/marker/nonDestChip"
import { Command, getCommandDesc, LatLngCommand } from "@/lib/commands/commands"
import { getMinTurnRadius } from "@/lib/dubins/dubinWaypoints"
import { LatLng } from "@/lib/world/latlng"
import { useMap } from "@/util/context/MapContext"
import { useVehicle } from "@/util/context/VehicleTypeContext"
import { useWaypoints } from "@/util/context/WaypointContext"
import { commandName } from "@/util/translationTable"
import { ReactNode } from "react"
import { Circle } from "react-leaflet"

type props = {
  basePosition: LatLng,
  command: { cmd: LatLngCommand, id: number, other: Command[] }
  onMove: (lat: number, lng: number, id: number) => void,
  onClick: (id: number) => void,
  active: boolean,
}

export default function CommandMarker({ basePosition, onMove, command, onClick, active }: props) {

  const { waypoints, activeMission, selectedWPs } = useWaypoints()
  const { viewable } = useMap()
  const { vehicle } = useVehicle()

  let items: ReactNode[] = []

  let a = 0

  // Add loiter radius
  if (viewable["loiter radius"] && command.cmd.type === 17 || command.cmd.type === 18 || command.cmd.type === 19) {

    // make sure the right radius is used, default to plane specific, otherwise use command param
    let radius = command.cmd.params.radius
    if (radius === 0 && vehicle.type === "Plane") {
      radius = getMinTurnRadius(vehicle.maxBank, vehicle.cruiseAirspeed)
    }

    items.push(<Circle
      key={a++}
      center={basePosition}
      radius={radius}
      fill={undefined}
      dashArray={"10, 10"}
    />)
  }

  return (
    <div>
      <DraggableMarker
        position={basePosition}
        onMove={(lat, lng) => onMove(lat, lng, command.id)}
        active={active}
        onClick={() => onClick(command.id)}
      />
      {items}

      {command.other.map((cmd, id) => {
        const isActive = (() => {
          const x = waypoints.findNthPosition(activeMission, command.id + 1 + id);
          return x?.[0] === activeMission && selectedWPs.includes(x[1]);
        })()

        return (
          <NonDestChip
            key={id}
            name={commandName(getCommandDesc(cmd.type).name)}
            offset={id}
            position={basePosition}
            active={isActive}
            onClick={() => onClick(command.id + id + 1)}
          />
        );
      })}
    </div>
  )
}
