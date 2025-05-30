"use client"
import { useState } from "react";
import { cn } from "@/lib/utils";
import Button from "../toolBar/button";
import HeightMap from "@/components/waypointEditor/terrain/heightMap";
import ParamEditor from "./params/ParamEditor";
import { FaArrowDown } from "react-icons/fa";
import { Optimise } from "./optimisaion/optimisation";

const tabs = {
  "Params": <ParamEditor />,
  "Terrain": <HeightMap />,
  "Optimise": <Optimise />
}

export default function Editor() {

  const [hidden, setHidden] = useState(false)
  const [tab, setTab] = useState<keyof typeof tabs>("Params");

  return (
    <>
      {hidden ? <Button className="absolute z-20 rounded-lg left-2 bottom-2" onClick={() => setHidden(false)}>Editor</Button> : null}
      <div className={cn("z-20 p-2 absolute bottom-0 w-full md:w-[600px] lg:w-[920px] ease-in-out duration-200", hidden ? "bottom-[-100dvh]" : "")}>
        <div className={cn("bg-white w-full rounded-lg shadow-lg shadow-black flex h-72 md:h-60 flex-col md:flex-row")}>
          <div className="flex flex-row md:flex-col">
            <div className="flex-grow flex flex-row md:flex-col">
              {Object.keys(tabs).filter((x) => process.env.NEXT_PUBLIC_ALLOWDUBINS || x !== "Optimise").map((x, i) => (
                <Button key={i} onClick={() => setTab(x as keyof typeof tabs)} className={cn("w-28", x != tab ? "bg-white" : null)}>{x}</Button>
              ))}
            </div>
            <Button onClick={() => setHidden(true)} className={cn("w-28 bg-white")}>Hide <FaArrowDown className="ml-2" /></Button>
          </div>
          <div className="p-2">
            <div className="w-full h-[2px] bg-slate-200 md:h-full md:w-[2px]"></div>
          </div>
          <div className="flex-1 flex min-h-0">
            {tabs[tab]}
          </div>
        </div>
      </div >
    </>

  )
}
