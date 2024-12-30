"use client"
import StartModal from "@/components/modal/startModal";
import ToolBar from "@/components/toolBar/ToolBar";
import Editor from "@/components/waypointEditor/editor";
import ListView from "@/components/waypointList/ListView";
import dynamic from "next/dynamic";

const NonSSRMap = dynamic(
    () => import("@/components/map/WaypointMap"),
    { ssr: false }
);

export default function Home() {
  return (
    <main style={{height: "100vh"}} className="flex flex-col absolute w-full">
      <StartModal/>

      <NonSSRMap></NonSSRMap>
      <ToolBar/>

      <Editor/>
      <ListView></ListView>
      
    </main>
    
  );
}
