"use client"

import { useWaypoints } from "@/util/context/WaypointContext"
import { syncIcons } from "../modal/IO/cloudSync";
import { MapPinned } from "lucide-react";

export default function MissionIcon() {
  const { syncStatus } = useWaypoints();
  if (syncStatus == "idle") {
    return <MapPinned className="h-5 w-5 mr-1" />
  }
  return syncIcons[syncStatus]
}
