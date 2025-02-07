"use client"
import { useWaypointContext } from "@/util/context/WaypointContext";
import { Node } from "@/types/waypoints";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Button from "../toolBar/button";
import HeightMap from "./terrain/heightMap";
import ParamEditor from "./params/ParamEditor";
import { FaArrowDown } from "react-icons/fa";
import { Optimise } from "./optimisaion/optimisation";

const tabs = {
  "Params": <ParamEditor />,
  "Terrain": <HeightMap />,
  "Opimise": <Optimise />
}

export default function Editor() {

  const { activeMission, selectedWPs, waypoints } = useWaypointContext()
  const [hidden, setHidden] = useState(false)
  const [tab, setTab] = useState<keyof typeof tabs>("Params");


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

  return (
    <>
      {hidden ? <Button className="absolute z-20 rounded-lg left-2 bottom-2" onClick={() => setHidden(false)}>Editor</Button> : null}
      <div className={cn("z-20 p-2 absolute bottom-0 w-full md:w-[600px] lg:w-[920px] ease-in-out duration-200", hidden ? "bottom-[-100dvh]" : "")}>
        <div className={cn("bg-white w-full rounded-lg shadow-lg shadow-black flex h-60 flex-col md:flex-row")}>
          <div className="flex flex-row md:flex-col">
            <div className="flex-grow flex flex-row md:flex-col">
              {Object.keys(tabs).map((x, i) => (
                <Button key={i} onClick={() => setTab(x as keyof typeof tabs)} className={cn("w-28", x != tab ? "bg-white" : null)}>{x}</Button>
              ))}
            </div>
            <Button onClick={() => setHidden(true)} className={cn("w-28 bg-white")}>Hide <FaArrowDown className="ml-2" /></Button>
          </div>
          <div className="w-1 mx-2 h-full bg-gray-200"></div>
          <div className="flex-grow flex flex-wrap">
            {tabs[tab]}
          </div>
        </div>
      </div >
    </>

  )
}
