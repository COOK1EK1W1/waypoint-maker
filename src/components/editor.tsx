"use client"
import StartModal from "@/components/modal/startModal";

import ListView from "@/components/waypointList/ListView";
import dynamic from "next/dynamic";
import Editor from "@/components/waypointEditor/editor";
import { useMap } from "@/util/context/MapContext";
import { useWaypoints } from "@/util/context/WaypointContext";
import { avgLatLng } from "@/lib/world/distance";
import { filterLatLngAltCmds } from "@/lib/commands/commands";
import { getLatLng } from "@/util/WPCollection";
import { useEffect } from "react";

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
