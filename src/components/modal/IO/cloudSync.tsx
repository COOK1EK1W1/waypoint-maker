"use client"
import Button from "@/components/toolBar/button";
import { syncStatusKeys, useWaypoints } from "@/util/context/WaypointContext";
import { createNewMission, syncMission } from "./syncAction";
import { ReactNode, useEffect, useTransition } from "react";
import { exportwpm2 } from "@/lib/missionIO/wm2/spec";
import { useVehicle } from "@/util/context/VehicleTypeContext";
import { useSession } from "@/util/auth-client";
import { Check, CloudUpload, LoaderIcon } from "lucide-react";

// small map between syncing states and icons
const icons: { [K in (typeof syncStatusKeys[number])]: ReactNode } = {
  "synced": <Check className="h-[20px] w-[20px] mr-1" />,
  "syncing": <LoaderIcon className="h-[20px] w-[20px] mr-1 animate-spin" />,
  "idle": null,
  "notSynced": <CloudUpload className="h-[20px] w-[20px] mr-1" />
}

export default function CloudSync() {
  const { data } = useSession()

  const { waypoints, missionId, syncStatus, setSyncStatus, ownerId } = useWaypoints();
  const { vehicle } = useVehicle();

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isPending) {
      setSyncStatus("syncing")
    }
  }, [isPending])

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
    return <Button className="w-28" onClick={handleCreateNew}>Sync Now</Button>
  }

  const handleSync = () => {
    startTransition(() => {
      syncMission(missionId, exportwpm2(waypoints, vehicle)).then(() => { setSyncStatus("synced") })
    })
  }

  if (data?.user.id !== undefined && data?.user.id !== ownerId) {
    return (
      <div className="flex items-center">
        <Button className="w-28" onClick={handleCreateNew}>Create Copy</Button>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <Button className="items-center justify-start w-32" onClick={handleSync}>
        {icons[syncStatus]}
        Sync Now
      </Button>
    </div >
  )
}

