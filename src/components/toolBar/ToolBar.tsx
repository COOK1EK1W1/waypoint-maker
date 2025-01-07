import { useWaypointContext } from "../../util/context/WaypointContext"
import WPCheck from "./WPcheck"
import VehicleTypeButton from "../vehicleType/vehicleTypeButton"
import Image from "next/image"
import MissionIO from "./missionIO"
import OptimiseButton from "./optimise"
import { get_waypoints } from "@/util/WPCollection"
import { cn } from "@/lib/utils"

export default function ToolBar() {
  const { waypoints } = useWaypointContext()

  let wps = get_waypoints("Main", waypoints)

  //find if the current waypoints contain a dubinds type
  const hasDubins = wps.map((wp) => wp.type).includes(69)

  return <div className="z-20 absolute top-2 left-2 rounded-lg overflow-hidden">
    <div className="flex bg-white items-center">
      <Image width={46} height={32} className="h-9 px-2" src="/logo-192x192.png" alt="Waypoint Maker Logo" />
      <h1 className="mx-4 py-0 hidden lg:flex items-center">Waypoint Maker</h1>
      <MissionIO />
      <WPCheck />
      <VehicleTypeButton />
      <OptimiseButton className={cn(hasDubins ? "w-28" : "w-0 p-0 m-0 border-0", "overflow-hidden")} />
    </div>
  </div>
}
