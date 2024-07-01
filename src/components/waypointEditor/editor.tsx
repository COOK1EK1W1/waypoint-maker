"use client"
import { useWaypointContext } from "@/util/context/WaypointContext";
import { LatLngEditor } from "./LatLngEditor";
import WaypointEditor from "./WaypointEditor";
import CurEdit from "./curEdit";
import { Node } from "@/types/waypoints";

export default function Editor(){

  const {activeMission, selectedWPs, waypoints} = useWaypointContext()




  const mission = waypoints.get(activeMission)
  if (mission == undefined) return null

  let wps: Node[] = [];
  let wpsIds: number[] = [];
  if (selectedWPs.length === 0) {
    wps = mission;
    wpsIds = mission.map((_, index) => index);
  } else {
    wps = mission.filter((_, id) => selectedWPs.includes(id));
    wpsIds = selectedWPs;
  }

  if (wps.length == 0){
    return (
      <div className="flex">
        <CurEdit/>
        <div className="h-[106px] flex w-full items-center justify-center">
          Place a waypoint to begin editing
        </div>
      </div>
    )

  }

  return (
    <div className="flex">
      <CurEdit/>
      <div>
        <WaypointEditor/>
        <LatLngEditor/>
      </div>
    </div>

  )
}
