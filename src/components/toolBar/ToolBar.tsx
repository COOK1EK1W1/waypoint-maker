import WPCheck from "@/components/toolBar/WPcheck"
import VehicleTypeButton from "@/components/vehicleType/vehicleTypeButton"
import Image from "next/image"
import MissionIO from "@/components/toolBar/missionIO"
import User, { UserSkeleton } from "@/components/toolBar/user"
import { Suspense } from "react"

export default function ToolBar() {

  return <div className="z-20 absolute top-0 left-0 overflow-hidden w-full md:w-fit">
    <div className="p-2">
      <div className="flex bg-white items-center shadow-lg rounded-lg overflow-auto">
        <Image width={46} height={32} className="h-9 px-2" src="/logo-192x192.png" alt="Waypoint Maker Logo" />
        <h1 className="mx-4 py-0 hidden lg:flex items-center">Waypoint Maker</h1>
        <MissionIO />
        <WPCheck />
        <VehicleTypeButton />
        {process.env.ALLOWLOGIN ? <Suspense fallback={<UserSkeleton />}><User /></Suspense> : null}
      </div>
    </div>
  </div>
}
