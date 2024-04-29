import { formatDistance, haversineDistance, gradient } from "@/util/distance";
import { useWaypointContext } from "../../util/context/WaypointContext"
import WaypointTypeSelector from "./WaypointTypeSelector";
import { commands } from "@/util/commands";
import Parameter from "./Parameter";
import { LatLngEditor } from "./LatLngEditor";
import { CollectionType } from "@/types/waypoints";

export default function WaypointEditor(){
  const {activeMission, selectedWPs, waypoints, setWaypoints} = useWaypointContext()

  const mission = waypoints.get(activeMission)
  if (mission == undefined) return null

  const active = selectedWPs[0]

  //on change function
  function change(e: React.ChangeEvent<HTMLInputElement>){
    setWaypoints((prevWaypoints) => {
      let newWaypoints = [...mission];
      let key = e.target.name as keyof Waypoint;
      let updatedWaypoint = { ...prevWaypoints[active || 0] };
      updatedWaypoint[key] = Number(e.target.value);
      newWaypoints[active || 0] = updatedWaypoint;

      return prevWaypoints.set(activeMission, newWaypoints);
    })
  }

  // if there is no waypoint selected show editor default
  if (selectedWPs.length == 0){
    return <div>editor</div>
  }

  const current = mission[active]
  if (current.type == "Collection") return
  let prev = undefined

  let distanceFromPrev = undefined
  if (active > 0){
    prev = mission[active-1]
    if (prev.type == "Collection") return
    distanceFromPrev = haversineDistance(current.wps.param5, current.wps.param6, prev.wps.param5, prev.wps.param6)
    
  }
  
  const commanddesc = commands[commands.findIndex(a => a.value==current.wps.type)]
  const hasLocationParams = commanddesc.parameters[4] && 
  commanddesc.parameters[5] &&
  commanddesc.parameters[4].label == "Latitude" &&
  commanddesc.parameters[5].label == "Longitude"


  return <div className="w-full p-2">
    <WaypointTypeSelector/>
    <div>
      <span>{commanddesc.description}</span>
    </div>

    <div className="flex flex-wrap flex-row">
      <Parameter param={commanddesc.parameters[0]} name="param1" change={change} value={current.wps.param1}/>
      <Parameter param={commanddesc.parameters[1]} name="param2" change={change} value={current.wps.param2}/>
      <Parameter param={commanddesc.parameters[2]} name="param3" change={change} value={current.wps.param3}/>
      <Parameter param={commanddesc.parameters[3]} name="param4" change={change} value={current.wps.param4}/>
      {!hasLocationParams && <Parameter param={commanddesc.parameters[4]} name="param5" change={change} value={current.wps.param5}/>}
      {!hasLocationParams && <Parameter param={commanddesc.parameters[5]} name="param6" change={change} value={current.wps.param6}/>}
      <Parameter param={commanddesc.parameters[6]} name="param7" change={change} value={current.wps.param7}/>
    </div>
    
    {hasLocationParams && <LatLngEditor/>}

    {/*<div>
      {distanceFromPrev && formatDistance(distanceFromPrev)}
      {distanceFromPrev && gradient(distanceFromPrev, (prev || current).param7, current.param7)}
    </div>*/}

  </div>
}
