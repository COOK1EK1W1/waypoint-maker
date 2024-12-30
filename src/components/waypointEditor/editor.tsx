"use client"
import { useWaypointContext } from "@/util/context/WaypointContext";
import { LatLngEditor } from "./LatLngEditor";
import WaypointEditor from "./WaypointEditor";
import CurEdit from "./curEdit";
import { Node } from "@/types/waypoints";
import { useState } from "react";
import { cn } from "@/util/tw";
import HeightMap from "./heightMap";
import Button from "../toolBar/button";

export default function Editor(){

  const {activeMission, selectedWPs, waypoints} = useWaypointContext()
  const [hidden, setHidden] = useState(false)




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
    return

  }

  return (
    <>
    {hidden?<Button className="absolute z-20 rounded-lg left-2 bottom-2" onClick={()=>setHidden(false)}>WP list</Button>:null}
    <div className={cn("z-20 absolute bottom-0 m-2 w-[930px] ease-in-out duration-200", hidden ? "bottom-[-100vh]": "")}>
      <div className={cn("bg-white rounded-lg shadow-lg shadow-black")}>
        <div className="flex">
          <CurEdit onHide={() => setHidden(true)}/>
          <div className="flex flex-wrap">
            <WaypointEditor/>
            <LatLngEditor/>
          </div>
        </div>
        <HeightMap/>
      </div>
    </div>
    </>

  )
}
