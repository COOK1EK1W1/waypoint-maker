"use client"
import Button from "@/components/toolBar/button";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { syncMission } from "./syncAction";

export default function CloudSync() {
  const { waypoints } = useWaypointContext();

  console.log(waypoints)

  return (
    <div>
      <Button onClick={() => { syncMission("1", JSON.stringify(Array.from(waypoints), null, 2)) }}> Sync Now</Button>
    </div >

  )

}

