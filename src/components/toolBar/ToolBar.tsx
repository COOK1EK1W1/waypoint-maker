import WPCheck from "@/components/toolBar/WPcheck"
import VehicleTypeButton from "@/components/vehicleType/vehicleTypeButton"
import MissionIO from "@/components/toolBar/missionIO"
import User, { UserSkeleton } from "@/components/toolBar/user"
import { Suspense } from "react"
import SystemModal from "../modal/system"
import MapControlls from "./mapControlls"

export default function ToolBar({ isStatic }: { isStatic: boolean }) {
  return (
    <div className="z-20 absolute top-0 left-0 overflow-hidden w-full md:w-fit">
      <div className="p-2">
        <div className="flex bg-white items-center shadow-lg rounded-lg overflow-auto">
          <SystemModal />
          <MissionIO isStatic={isStatic} />
          <WPCheck />
          <VehicleTypeButton />
          {!isStatic ? <Suspense fallback={<UserSkeleton />}>
            <User />
          </Suspense> : null}

        </div>
      </div>
      <div className="p-2">
        <MapControlls />
      </div>
    </div >
  )

}
