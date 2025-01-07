import { useWaypointContext } from "../../util/context/WaypointContext"
import WPCheck from "./WPcheck"
import Button from "@/components/toolBar/button"
import VehicleTypeButton from "../vehicleType/vehicleTypeButton"
import { bakeDubins } from "./bakeDubins"
import { pathEnergyRequirements, worldPathLength } from "@/lib/dubins/geometry"
import Image from "next/image"
import MissionIO from "./missionIO"

export default function ToolBar() {
  const { waypoints, activeMission, setWaypoints } = useWaypointContext()

  return <div className="z-20 absolute top-2 left-14 rounded-lg overflow-hidden">
    <div className="flex bg-white items-center">
      <Image width={46} height={32} className="h-9 px-2" src="/logo-192x192.png" alt="Waypoint Maker Logo" />
      <h1 className="mx-4 py-0 hidden lg:flex items-center">Waypoint Maker</h1>
      <MissionIO />
      <WPCheck />
      <VehicleTypeButton />
      <Button onClick={() => bakeDubins(waypoints, activeMission, setWaypoints, worldPathLength)}>Opimise Length</Button>
      <Button onClick={() => bakeDubins(waypoints, activeMission, setWaypoints, pathEnergyRequirements)}>Optimise Energy</Button>
    </div>
  </div>
}
