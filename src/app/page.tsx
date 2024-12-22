"use client"
import StartModal from "@/components/modal/startModal";
import ToolBar from "@/components/toolBar/ToolBar";
import Editor from "@/components/waypointEditor/editor";
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
      <StartModal/>

      <NonSSRMap></NonSSRMap>
      <ToolBar/>
      <div className="z-20 absolute bottom-0 m-2 w-[1080px]">

        <div className="bg-white rounded-lg">
        <Editor/>
        <HeightMap/>
        </div>
      </div>
      <ListView></ListView>
      
    </main>
    
  );
}
