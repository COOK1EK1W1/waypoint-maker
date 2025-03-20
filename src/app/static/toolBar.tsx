import MissionIO from "@/components/toolBar/missionIO";
import { ToolBarWrapper } from "@/components/toolBar/ToolBar";
import WPCheck from "@/components/toolBar/WPcheck";
import VehicleTypeButton from "@/components/vehicleType/vehicleTypeButton";
import Image from "next/image";


export default function ToolBar() {

  return (
    <ToolBarWrapper>
      <Image width={46} height={32} className="h-9 px-2" src="/logo-192x192.png" alt="Waypoint Maker Logo" />
      <h1 className="mx-4 py-0 hidden lg:flex items-center">Waypoint Maker</h1>
      <MissionIO />
      <WPCheck />
      <VehicleTypeButton />
    </ToolBarWrapper>

  )
}

