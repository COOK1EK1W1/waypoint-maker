"use client"
import Button from "@/components/toolBar/button";
import { useWaypoints } from "@/util/context/WaypointContext";
import { syncMission } from "./syncAction";
import { useState, useTransition } from "react";
import { FaCheck, FaSpinner } from "react-icons/fa";

export default function CloudSync() {
  const { waypoints, missionId } = useWaypoints();

  const [isPending, startTransition] = useTransition();
  const [b, setb] = useState(false)
  if (missionId) {
    return (
      <div className="flex items-center">
        <Button onClick={() => startTransition(() => syncMission(missionId, waypoints.jsonify()).then(() => { setb(true) }))}> Sync Now</Button>
        <span className="pl-1">
          {isPending ? <FaSpinner className="animate-spin" /> : b ? <FaCheck /> : null}
        </span>
      </div >

    )
  } else {
    // todo convert to cloud synced
    return <div>Not Synced</div>

  }

}

