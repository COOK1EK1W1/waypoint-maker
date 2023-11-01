"use client"
import ToolBar from "@/components/toolBar/ToolBar";
import WaypointEditor from "@/components/waypointEditor/WaypointEditor";
import ListView from "@/components/waypointList/ListView";
import dynamic from "next/dynamic";

const NonSSRMap = dynamic(
    () => import("@/components/WaypointMap"),
    { ssr: false }
);

export default function Home() {
  return (
    <main>
      <h1>Waypoint Maker</h1>
      <ToolBar/>
      <div className="flex flex-row">
        <NonSSRMap></NonSSRMap>
        <ListView></ListView>

      </div>
      <WaypointEditor></WaypointEditor>
      
    </main>
    
  );
}
