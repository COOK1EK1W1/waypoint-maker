import WPCheck from "./WPcheck"
import VehicleTypeButton from "../vehicleType/vehicleTypeButton"
import Image from "next/image"
import MissionIO from "./missionIO"
import OptimiseButton from "./optimise"
import User from "./user"

export default function ToolBar() {

  return <div className="z-20 absolute top-2 left-2 rounded-lg overflow-hidden shadow-lg w-full md:w-fit">
    <div className="flex bg-white items-center">
      <Image width={46} height={32} className="h-9 px-2" src="/logo-192x192.png" alt="Waypoint Maker Logo" />
      <h1 className="mx-4 py-0 hidden lg:flex items-center">Waypoint Maker</h1>
      <MissionIO />
      <WPCheck />
      <VehicleTypeButton />
      <OptimiseButton />
      <User />
    </div>
  </div>
}
