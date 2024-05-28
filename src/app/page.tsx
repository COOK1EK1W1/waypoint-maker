"use client"
import ToolBar from "@/components/toolBar/ToolBar";
import { LatLngEditor } from "@/components/waypointEditor/LatLngEditor";
import WaypointEditor from "@/components/waypointEditor/WaypointEditor";
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
      <div className="flex flex-row w-full grow h-full">
        <div className="flex flex-col grow">
          <NonSSRMap></NonSSRMap>
          <WaypointEditor></WaypointEditor>
          <LatLngEditor/>
        
        </div>

        <ListView></ListView>
      </div>
      
    </main>
    
  );
}
