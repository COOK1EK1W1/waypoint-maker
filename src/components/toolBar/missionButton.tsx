"use client"

import { useWaypoints } from "@/util/context/WaypointContext"
import { syncIcons } from "../modal/IO/cloudSync";
import { MapPinned } from "lucide-react";

export default function MissionIcon() {
  const { syncStatus } = useWaypoints();
  if (syncStatus == "idle") {
    return <MapPinned />
  }
  return syncIcons[syncStatus]
}
