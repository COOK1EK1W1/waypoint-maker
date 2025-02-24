"use client"
import Button from "@/components/toolBar/button";
import { downloadTextAsFile } from "@/lib/missionIO/common";
import { waypointTo_waypoints_file } from "@/lib/missionIO/waypointToFile";
import { useWaypoints } from "@/util/context/WaypointContext";
import { FaFileDownload } from "react-icons/fa";

export default function DownloadButtons() {
  const { waypoints } = useWaypoints()

  function downloadQGC() {
    const output = waypointTo_waypoints_file(waypoints)
    downloadTextAsFile("mission.waypoints", output)
  }


  function downloadWM() {
    const output = waypoints.jsonify()
    downloadTextAsFile("mission.json", output)
  }


  return (
    <>
      <Button onClick={downloadQGC}><FaFileDownload className="inline mx-2" />.waypoints (QGC, MP) download</Button>
      <Button onClick={downloadWM}><FaFileDownload className="inline mx-2" />.json (WM) download</Button>
    </>
  )
}
