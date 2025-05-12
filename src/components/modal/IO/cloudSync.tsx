"use client"
import Button from "@/components/toolBar/button";
import { syncStatusKeys, useWaypoints } from "@/util/context/WaypointContext";
import { createNewMission, syncMission } from "./syncAction";
import { ReactNode, useEffect, useTransition } from "react";
import { exportwpm2 } from "@/lib/missionIO/wm2/spec";
import { useVehicle } from "@/util/context/VehicleTypeContext";
import { Check, CircleAlert, CloudUpload, LoaderIcon } from "lucide-react";
import { Session } from "better-auth";

// small map between syncing states and icons
export const syncIcons: { [K in (typeof syncStatusKeys[number])]: ReactNode } = {
  "synced": <Check className="h-5 w-5 mr-1" />,
  "syncing": <LoaderIcon className="h-5 w-5 mr-1 animate-spin" />,
  "idle": null,
  "notSynced": <CloudUpload className="h-5 w-5 mr-1" />,
  "error": <CircleAlert className="h-5 w-5 mr-1" />
}

export default function CloudSync({ data }: { data: { session: Session, user: { id: string } } }) {

  const { waypoints, missionId, syncStatus, setSyncStatus, ownerId } = useWaypoints();
  const { vehicle } = useVehicle();

  const [isPending, startTransition] = useTransition();

  // make sure the state is set to syncing when transtion is fired
  useEffect(() => {
    if (isPending) {
      setSyncStatus("syncing")
    }
  }, [isPending])


  // on base url create a new mission in DB
  const handleCreateNew = () => {
    const title = prompt("Enter Title")
    if (title === null || title.length === 0) {
      return null
    }
    startTransition(() => {
      createNewMission(title, exportwpm2(waypoints, vehicle)).then((x) => {
        if (x.error !== null) {
          alert(`There was an error: ${x.error}`)
          setSyncStatus("error")
        }
      })
    })
  }

  // the user is on base url, allow to convert to stored mission
  if (missionId === undefined) {
    return <Button className="w-28" onClick={handleCreateNew}>Sync Now</Button>
  }

  // sync handler for button click
  const handleSync = () => {
    startTransition(() => {
      syncMission(missionId, exportwpm2(waypoints, vehicle)).then((x) => {
        if (x.error !== null) {
          alert(`There was an error: ${x.error}`)
          setSyncStatus("error")
        } else {
          setSyncStatus("synced")
        }
      })
    })
  }

  // If the current user doens't own the mission, allow them to make a copy
  if (data.user.id !== ownerId) {
    return (
      <div className="">
        You are currently viewing a mission owned by someone else.
        <Button className="w-32" onClick={handleCreateNew}>Create Copy</Button>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <Button className="items-center justify-start w-32" onClick={handleSync}>
        {syncIcons[syncStatus]}
        Sync Now
      </Button>
    </div >
  )
}

