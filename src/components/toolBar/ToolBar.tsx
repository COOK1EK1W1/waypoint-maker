import { downloadTextAsFile, waypointTo_waypoints_file } from "@/util/waypointToFile"
import { useWaypointContext } from "../../util/context/WaypointContext"
import WPCheck from "./WPcheck"

export default function ToolBar(){
  const {waypoints} = useWaypointContext()

  function download(){
    const output = waypointTo_waypoints_file(waypoints)
    downloadTextAsFile("mission.waypoints", output)
    console.log(output)
    
  }
  return <div className="flex">
    <h1>Waypoint Maker</h1>
    <button onClick={download} className="p-1 m-1 border-1 rounded-lg bg-slate-200">.waypoints (QGC, MP) download</button>
    <WPCheck/>
  </div>
}
