import { useWaypointContext } from "../WaypointContext"
import ListItem from "./ListItem"

export default function ListView(){
  const {waypoints, setWaypoints} = useWaypointContext()
  return <div style={{width: "400px"}}>
    {waypoints.map((i, id) => (
      <ListItem id={id} key={id}></ListItem>
    ))}

  </div>
}