import { downloadTextAsFile, waypointTo_waypoints_file } from "@/util/waypointToFile"
import { useWaypointContext } from "../../util/context/WaypointContext"
import WPCheck from "./WPcheck"
import LoadJson from "./load"
import Button from "./button"
import { FaFileDownload } from "react-icons/fa"

export default function ToolBar(){
  const {waypoints} = useWaypointContext()

  function downloadQGC(){
    const output = waypointTo_waypoints_file(waypoints)
    downloadTextAsFile("mission.waypoints", output)
  }


  function downloadWM(){
    const output = JSON.stringify(Array.from(waypoints), null, 2)
    downloadTextAsFile("mission.json", output)
  }

  return <div className="h-9 flex">
    <h1 className="mx-4 py-0">Waypoint Maker</h1>
    <Button onClick={downloadQGC}><FaFileDownload className="inline mx-2"/>.waypoints (QGC, MP) download</Button>
    <Button onClick={downloadWM}><FaFileDownload className="inline mx-2"/>.json (WM) download</Button>
    <LoadJson/>
    <WPCheck/>
  </div>
}
