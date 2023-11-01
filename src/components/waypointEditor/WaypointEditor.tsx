import { useWaypointContext } from "../WaypointContext"

export default function WaypointEditor(){
  const {active, waypoints} = useWaypointContext()
  if (active == null){
    return <div>editor</div>
  }
  return <div className="w-full">

    {active}
    {waypoints[active].lat}
    {waypoints[active].lng}
  </div>
}