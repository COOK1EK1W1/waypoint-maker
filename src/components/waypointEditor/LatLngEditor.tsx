import { useWaypointContext } from "../../util/context/WaypointContext";

export function LatLngEditor(){
  const {active, waypoints, setWaypoints} = useWaypointContext()

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

  function nudge(x: number, y: number){
    setWaypoints((prevWaypoints) => {
      let newWaypoints = [...prevWaypoints];
      let updatedWaypoint = { ...prevWaypoints[active || 0] };
      updatedWaypoint.param5 = updatedWaypoint.param5 + 0.0004 * y
      updatedWaypoint.param6 = updatedWaypoint.param6 + 0.0004 * x
      newWaypoints[active || 0] = updatedWaypoint;

      return newWaypoints;
    })

  }
  const current = waypoints[active || 0]
  return <div className="flex flex-row border-2 p-2 rounded-3xl" >
    <div className="flex flex-col place-content-around">
      <div>Latitude <input type="number" name="param5" onChange={change} value={current.param5} step={0.0001}/></div>
      <div>Longitude <input type="number" name="param6" onChange={change} value={current.param6} step={0.0001}/></div>
    </div>
    <div>
      <div className="flex flex-row">
        <div className="w-8 h-8"></div>
        <button className="w-8 h-8" onClick={()=>{nudge(0, 1)}}>up</button>
        <div className="w-8 h-8"></div>
        </div>
      <div className="flex flex-row">
        <button className="w-8 h-8" onClick={()=>{nudge(-1, 0)}}>left</button>
        <div className="w-8 h-8"></div>
        <button className="w-8 h-8" onClick={()=>{nudge(1, 0)}}>rigt</button>
      </div>
      <div className="flex flex-row">
        <div className="w-8 h-8"></div>
        <button className="w-8 h-8" onClick={()=>{nudge(0,-1)}}>dwn</button>
        <div className="w-8 h-8"></div>
      </div>
    </div>
  </div>
}