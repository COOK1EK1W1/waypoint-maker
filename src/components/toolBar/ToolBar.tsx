import { downloadTextAsFile, waypointTo_waypoints_file } from "@/util/waypointToFile"
import { useWaypointContext } from "../../util/context/WaypointContext"

export default function ToolBar(){
  const {waypoints} = useWaypointContext()

  function download(){
    const output = waypointTo_waypoints_file(waypoints)
    downloadTextAsFile("mission.waypoints", output)
    console.log(output)
    
  }
  return <div>
    <button onClick={download} className="p-2 border-1 border-slate-100 rounded bg-slate-200">.waypoints (QGC, MP) download</button>
    TOOOL BAR
  </div>
}