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
      <input type="number" name="lat" value={waypoints[active].lat} onChange={change}/>
      <input type="number" name="lng" onChange={change} value={waypoints[active].lng}/>
      <input type="number" name="alt" onChange={change} value={waypoints[active].alt}/>

    </div>
    

    <input type="number" name="param1" onChange={change} value={waypoints[active].param1}/>
    <input type="number" name="param2" onChange={change} value={waypoints[active].param2}/>
    <input type="number" name="param3" onChange={change} value={waypoints[active].param3}/>
    <input type="number" name="param4" onChange={change} value={waypoints[active].param4}/>
    <div>
      {active > 0 && formatDistance( haversineDistance(waypoints[active].lat, waypoints[active].lng, waypoints[active-1].lat, waypoints[active-1].lng))}
      {active > 0 && gradient(haversineDistance(waypoints[active].lat, waypoints[active].lng, waypoints[active-1].lat, waypoints[active-1].lng), waypoints[active-1].alt, waypoints[active].alt)}
    </div>

  </div>
}