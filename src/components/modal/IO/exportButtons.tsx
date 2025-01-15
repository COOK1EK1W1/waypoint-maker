"use client"
import Button from "@/components/toolBar/button";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { downloadTextAsFile, waypointTo_waypoints_file } from "@/util/waypointToFile";
import { FaFileDownload } from "react-icons/fa";

export default function DownloadButtons() {
  const { waypoints } = useWaypointContext()

  function downloadQGC() {
    const output = waypointTo_waypoints_file(waypoints)
    downloadTextAsFile("mission.waypoints", output)
  }


  function downloadWM() {
    const output = JSON.stringify(Array.from(waypoints), null, 2)
    downloadTextAsFile("mission.json", output)
  }


  return (
    <>
      <Button onClick={downloadQGC}><FaFileDownload className="inline mx-2" />.waypoints (QGC, MP) download</Button>
      <Button onClick={downloadWM}><FaFileDownload className="inline mx-2" />.json (WM) download</Button>
    </>
  )
}
