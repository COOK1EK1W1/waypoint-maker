import { downloadTextAsFile, waypointTo_waypoints_file } from "@/util/waypointToFile"
import { useWaypointContext } from "../../util/context/WaypointContext"
import WPCheck from "./WPcheck"
import LoadJson from "./load"
import Button from "@/components/toolBar/button"
import { FaFileDownload } from "react-icons/fa"
import VehicleTypeButton from "../vehicleType/vehicleTypeButton"
import { bakeDubins } from "./bakeDubins"
import { energyRequirement, pathEnergyRequirements, worldPathLength } from "@/lib/dubins/geometry"

export default function ToolBar(){
  const {waypoints, activeMission, setWaypoints} = useWaypointContext()

  function downloadQGC(){
    const output = waypointTo_waypoints_file(waypoints)
    downloadTextAsFile("mission.waypoints", output)
  }


  function downloadWM(){
    const output = JSON.stringify(Array.from(waypoints), null, 2)
    downloadTextAsFile("mission.json", output)
  }

  return <div className="z-20 absolute top-2 left-14 rounded-lg overflow-hidden">
    <div className="h-9 flex bg-white">
      <img className="h-9 px-2" src="/logo-192x192.png"/>
      <h1 className="mx-4 py-0 hidden lg:flex items-center">Waypoint Maker</h1>
      <Button onClick={downloadQGC}><FaFileDownload className="inline mx-2"/>.waypoints (QGC, MP) download</Button>
      <Button onClick={downloadWM}><FaFileDownload className="inline mx-2"/>.json (WM) download</Button>
      <LoadJson/>
      <WPCheck/>
      <VehicleTypeButton/>
      <Button onClick={()=>bakeDubins(waypoints, activeMission, setWaypoints, worldPathLength)}>Opimise Length</Button>
      <Button onClick={()=>bakeDubins(waypoints, activeMission, setWaypoints, pathEnergyRequirements)}>Optimise Energy</Button>
    </div>
  </div>
}
