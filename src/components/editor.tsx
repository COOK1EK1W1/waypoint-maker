"use client"
import StartModal from "@/components/modal/startModal";

import ListView from "@/components/waypointList/ListView";
import dynamic from "next/dynamic";
import Editor from "@/components/waypointEditor/editor";
export function WMEditor() {

  const NonSSRMap = dynamic(
    () => import("@/components/map/WaypointMap"),
    { ssr: false }
  );
  return (
    <main style={{ height: "100dvh" }
    } className="flex flex-col absolute w-full h-[100dvh]" >
      <StartModal />

      <NonSSRMap />

      <Editor />
      <ListView />

    </main>

  )
}
