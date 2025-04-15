"use client"
import Button from "@/components/toolBar/button";
import { useWaypoints } from "@/util/context/WaypointContext";
import { createNewMission, syncMission } from "./syncAction";
import { useState, useTransition } from "react";
import { FaCheck, FaSpinner } from "react-icons/fa";
import { exportwpm2 } from "@/lib/missionIO/wm2/spec";
import { useVehicle } from "@/util/context/VehicleTypeContext";
import { useSession } from "@/util/auth-client";

export default function CloudSync() {
  const { data } = useSession()

  const { waypoints, missionId } = useWaypoints();
  const { vehicle } = useVehicle();

  const [isPending, startTransition] = useTransition();
  const [synced, setSynced] = useState(false)

  // don't show anything if user isn't logged in
  if (data?.user == undefined) {
    return <div>Please sign in to use cloud syncing</div>
  }

  // on base url create a new mission in DB
  const handleCreateNew = () => {
    const title = prompt("Enter Title")
    if (title === null || title.length === 0) {
      return null
    }
    startTransition(() => {
      createNewMission(title, exportwpm2(waypoints, vehicle))
    })
  }

  // base url, convert to stored mission
  if (missionId === undefined) {
    return <Button onClick={handleCreateNew}>Sync Now</Button>
  }

  const handleSync = () => {
    startTransition(() => {
      syncMission(missionId, exportwpm2(waypoints, vehicle)).then(() => { setSynced(true) })
    })
  }

  return (
    <div className="flex items-center">
      <Button onClick={handleSync}> Sync Now</Button>
      <span className="pl-1">
        {isPending ? <FaSpinner className="animate-spin" /> : synced ? <FaCheck /> : null}
      </span>
    </div >

  )

}

