"use client"
import ToolBar from "@/components/toolBar/ToolBar";
import { LatLngEditor } from "@/components/waypointEditor/LatLngEditor";
import WaypointEditor from "@/components/waypointEditor/WaypointEditor";
import CurEdit from "@/components/waypointEditor/curEdit";
import HeightMap from "@/components/waypointEditor/heightMap";
import ListView from "@/components/waypointList/ListView";
import dynamic from "next/dynamic";

const NonSSRMap = dynamic(
    () => import("@/components/map/WaypointMap"),
    { ssr: false }
);

export default function Home() {
  return (
    <main style={{height: "100vh"}} className="flex flex-col absolute w-full">
      <ToolBar/>
      <div className="grid grid-cols-[1fr_300px] grid-rows-[1fr_300px] h-full">
        <div className="row-start-1 col-start-1">
          <NonSSRMap></NonSSRMap>
        </div>
        <div className="row-start-2 col-start-1">
          <div className="flex">
            <CurEdit/>
            <div>
              <WaypointEditor></WaypointEditor>
              <LatLngEditor/>
            </div>
          </div>
          <HeightMap/>
        </div>
        <div className="row-span-2 col-start-2">
        <ListView></ListView>
        </div>
      </div>
      
    </main>
    
  );
}
