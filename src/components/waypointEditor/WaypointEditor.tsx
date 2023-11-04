import { formatDistance, haversineDistance, gradient } from "@/util/distance";
import { useWaypointContext } from "../WaypointContext"
import WaypointTypeSelector from "./WaypointTypeSelector";
import { commands } from "@/util/commands";
import Parameter from "./Parameter";
import { LatLngEditor } from "./LatLngEditor";

export default function WaypointEditor(){
  const {active, waypoints, setWaypoints} = useWaypointContext()

  //on change function
  function change(e: React.ChangeEvent<HTMLInputElement>){
    setWaypoints((prevWaypoints) => {
      let newWaypoints = [...prevWaypoints];
      let key = e.target.name as keyof Waypoint;
      let updatedWaypoint = { ...prevWaypoints[active || 0] };
      updatedWaypoint[key] = Number(e.target.value);
      newWaypoints[active || 0] = updatedWaypoint;

      return newWaypoints;
    })
  }

  // if there is no waypoint selected show editor default
  if (active == null){
    return <div>editor</div>
  }

  const current = waypoints[active]
  let prev = undefined

  let distanceFromPrev = undefined
  if (active > 0){
    prev = waypoints[active-1]
    distanceFromPrev = haversineDistance(current.param5, current.param6, waypoints[active-1].param5, waypoints[active-1].param6)
    
  }
  
  const commanddesc = commands[commands.findIndex(a => a.value==waypoints[active || 0].type)]
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
      <Parameter param={commanddesc.parameters[0]} name="param1" change={change} value={current.param1}/>
      <Parameter param={commanddesc.parameters[1]} name="param2" change={change} value={current.param2}/>
      <Parameter param={commanddesc.parameters[2]} name="param3" change={change} value={current.param3}/>
      <Parameter param={commanddesc.parameters[3]} name="param4" change={change} value={current.param4}/>
      {!hasLocationParams && <Parameter param={commanddesc.parameters[4]} name="param5" change={change} value={current.param5}/>}
      {!hasLocationParams && <Parameter param={commanddesc.parameters[5]} name="param6" change={change} value={current.param6}/>}
      <Parameter param={commanddesc.parameters[6]} name="param7" change={change} value={current.param7}/>
    </div>
    
    {hasLocationParams && <LatLngEditor/>}

    <div>
      {distanceFromPrev && formatDistance(distanceFromPrev)}
      {distanceFromPrev && gradient(distanceFromPrev, waypoints[active-1].param7, current.param7)}
    </div>

  </div>
}