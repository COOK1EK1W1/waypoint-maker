import { formatDistance, haversineDistance, gradient } from "@/util/distance";
import { useWaypointContext } from "../WaypointContext"
import WaypointTypeSelector from "./WaypointTypeSelector";

export default function WaypointEditor(){
  const {active, waypoints, setWaypoints} = useWaypointContext()
  if (active == null){
    return <div>editor</div>
  }
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
  return <div className="w-full">

    <span>id {active}</span>
    <WaypointTypeSelector/>
    <div>
      <input type="number" name="param5" onChange={change} value={waypoints[active].param5}/>
      <input type="number" name="param6" onChange={change} value={waypoints[active].param6}/>
      <input type="number" name="param7" onChange={change} value={waypoints[active].param7}/>

    </div>
    

    <input type="number" name="param1" onChange={change} value={waypoints[active].param1}/>
    <input type="number" name="param2" onChange={change} value={waypoints[active].param2}/>
    <input type="number" name="param3" onChange={change} value={waypoints[active].param3}/>
    <input type="number" name="param4" onChange={change} value={waypoints[active].param4}/>
    <div>
      {active > 0 && formatDistance( haversineDistance(waypoints[active].param5, waypoints[active].param6, waypoints[active-1].param5, waypoints[active-1].param6))}
      {active > 0 && gradient(haversineDistance(waypoints[active].param5, waypoints[active].param6, waypoints[active-1].param5, waypoints[active-1].param6), waypoints[active-1].param7, waypoints[active].param7)}
    </div>

  </div>
}