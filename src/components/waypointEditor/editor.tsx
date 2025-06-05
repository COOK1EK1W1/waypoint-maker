"use client"
import { useState } from "react";
import { cn } from "@/lib/utils";
import HeightMap from "@/components/waypointEditor/terrain/heightMap";
import ParamEditor from "./params/ParamEditor";
import { Optimise } from "./optimisaion/optimisation";
import { ArrowDown } from "lucide-react";
import { Button } from "../ui/button";
import { useWaypoints } from "@/util/context/WaypointContext";

const tabs = {
  "Params": <ParamEditor />,
  "Terrain": <HeightMap />,
  "Optimise": <Optimise />
}

export default function Editor() {

  const [hidden, setHidden] = useState(false)
  const [tab, setTab] = useState<keyof typeof tabs>("Params");
  const { waypoints, activeMission, selectedWPs } = useWaypoints()
  const amount = selectedWPs.length

  return (
    <>
      {hidden ? <Button variant="active" className="absolute z-20 rounded-lg left-2 bottom-2" onClick={() => setHidden(false)}>Editor</Button> : null}
      <div className={cn("z-20 p-2 absolute bottom-0 w-full md:w-[600px] lg:w-[920px] ease-in-out duration-200", hidden ? "bottom-[-100dvh]" : "")}>
        <div className="flex justify-center">
          <svg height="24" width="32">
            <path d=" M 32 0 C 20 0, 12 24, 0 24 L 32 24 Z " fill="white" />
          </svg>
          <div className="h-[24px] bg-white px-2 flex items-center">
            <span className="inline-block">
              Editing: {amount > 0 ? `${amount} Waypoint${amount > 1 ? "s" : ""}` : `${activeMission} (${waypoints.get(activeMission).length})`}</span>
          </div>
          <svg height="24" width="32">
            <path d="M 0 0 C 12 0, 20 24, 32 24 L 0 24 Z " fill="white" />
          </svg>
        </div>
        <div className={cn("bg-card w-full rounded-lg shadow-lg shadow-black flex h-72 md:h-60 flex-col md:flex-row")}>
          <div className="flex flex-row md:flex-col">
            <div className="flex-grow flex flex-row md:flex-col">
              {Object.keys(tabs).filter((x) => process.env.NEXT_PUBLIC_ALLOWDUBINS || x !== "Optimise").map((x, i) => (
                <Button variant={x === tab ? "active" : "default"} key={i} onClick={() => setTab(x as keyof typeof tabs)}>{x}</Button>
              ))}
            </div>
            <Button onClick={() => setHidden(true)}>Hide <ArrowDown className="ml-2 h-5 w-5" /></Button>
          </div>
          <div className="p-2">
            <div className="w-full h-[2px] bg-muted md:h-full md:w-[2px]"></div>
          </div>
          <div className="flex-1 flex min-h-0">
            {tabs[tab]}
          </div>
        </div>
      </div >
    </>

  )
}
