"use client"
import { Button } from "@/components/ui/button";
import { downloadTextAsFile } from "@/lib/missionIO/common";
import { exportqgcWaypoints } from "@/lib/missionIO/qgcWaypoints/spec";
import { exportwpm2 } from "@/lib/missionIO/wm2/spec";
import { useVehicle } from "@/util/context/VehicleTypeContext";
import { useWaypoints } from "@/util/context/WaypointContext";
import { FileDown } from "lucide-react";

export default function DownloadButtons() {
  const { waypoints } = useWaypoints()
  const { vehicle } = useVehicle()

  function downloadQGC() {
    const output = exportqgcWaypoints(waypoints)
    downloadTextAsFile("mission.waypoints", output)
  }

  function downloadWM() {
    downloadTextAsFile("mission.json", exportwpm2(waypoints, vehicle))
  }

  return (
    <>
      <div>
        <Button variant="active" className="w-80 justify-start" onClick={downloadQGC}><FileDown className="inline mx-2" />.waypoints (QGC, MP) download</Button>
      </div>
      <div>
        <Button variant="active" className="w-80 justify-start" onClick={downloadWM}><FileDown className="inline mx-2" />.json (WM) download</Button>
      </div>
    </>
  )
}
