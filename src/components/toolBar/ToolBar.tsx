import { downloadTextAsFile, waypointTo_waypoints_file } from "@/util/waypointToFile"
import { useWaypointContext } from "../../util/context/WaypointContext"
import WPCheck from "./WPcheck"
import { Node, WaypointCollection } from "@/types/waypoints"
import LoadJson from "./load"

export default function ToolBar(){
  const {waypoints} = useWaypointContext()

  function download(){
    const output = waypointTo_waypoints_file(waypoints)
    downloadTextAsFile("mission.waypoints", output)
  }

  function jsonStringifyWaypointCollection(collection: WaypointCollection): string {
    // Convert the Map to an object first
    console.log(Array.from(collection))
    // JSON stringify the object
    return JSON.stringify(Array.from(collection), null, 2); // 'null, 2' for pretty printing
  }

  function a(){
    downloadTextAsFile("mission.json", jsonStringifyWaypointCollection(waypoints))

  }

  return <div className="flex">
    <h1>Waypoint Maker</h1>
    <button onMouseDown={download} className="p-1 m-1 border-1 rounded-lg bg-slate-200">.waypoints (QGC, MP) download</button>
    <button onMouseDown={a} className="p-1 m-1 border-1 rounded-lg bg-slate-200">.json (WM) download</button>
    <LoadJson/>
    <WPCheck/>
  </div>
}
