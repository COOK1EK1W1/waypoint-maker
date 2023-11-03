import { downloadTextAsFile, waypointToFile } from "@/util/waypointToFile"
import { useWaypointContext } from "../WaypointContext"

export default function ToolBar(){
  const {waypoints} = useWaypointContext()

  function download(){
    const output = waypointToFile(waypoints)
    downloadTextAsFile("mission.waypoints", output)
    console.log(output)
    
  }
  return <div>
    <button onClick={download} className="p-2 border-1 border-slate-100 rounded bg-slate-200">.waypoints (QGC) download</button>
    TOOOL BAR
  </div>
}