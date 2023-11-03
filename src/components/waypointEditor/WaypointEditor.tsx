import { formatDistance, haversineDistance, gradient } from "@/util/distance";
import { useWaypointContext } from "../WaypointContext"
import WaypointTypeSelector from "./WaypointTypeSelector";
import { commands } from "@/util/commands";

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


  return <div className="w-full">

    <span>id {active}</span>
    <WaypointTypeSelector/>
    <div>
      <span>{commanddesc.description}</span>
    </div>
    
    <div>
      {commanddesc.parameters[0] && commanddesc.parameters[0].label}
      <input type="number" name="param1" onChange={change} value={current.param1}/>
    </div>
    
    <div>
    {commanddesc.parameters[1] && commanddesc.parameters[1].label}
      <input type="number" name="param2" onChange={change} value={current.param2}/>
      </div>
    <div>
      {commanddesc.parameters[2] && commanddesc.parameters[2].label}
      <input type="number" name="param3" onChange={change} value={current.param3}/>
    </div>
    <div>
      {commanddesc.parameters[3] && commanddesc.parameters[3].label}
      <input type="number" name="param4" onChange={change} value={current.param4}/>
    </div>
    {hasLocationParams &&
      <div>
        <div>Latitude <input type="number" name="param5" onChange={change} value={current.param5} step={0.0001}/></div>
        <div>Longitude <input type="number" name="param6" onChange={change} value={current.param6} step={0.0001}/></div>
      </div>
    }

    {!hasLocationParams && commanddesc.parameters[4] && commanddesc.parameters[4].label}
    <input type="number" name="param5" onChange={change} value={current.param5}/>
    {!hasLocationParams && commanddesc.parameters[5] && commanddesc.parameters[5].label}
    <input type="number" name="param6" onChange={change} value={current.param6}/>
    {commanddesc.parameters[6] && commanddesc.parameters[6].label}
    <input type="number" name="param7" onChange={change} value={current.param7}/>
    
    <div>
      {distanceFromPrev && formatDistance(distanceFromPrev)}
      {distanceFromPrev && gradient(distanceFromPrev, waypoints[active-1].param7, current.param7)}
    </div>

  </div>
}