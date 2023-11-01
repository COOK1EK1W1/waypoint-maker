import { useWaypointContext } from "../WaypointContext"
import ListItem from "./ListItem"

export default function ListView(){
  const [waypoints, setWaypoints] = useWaypointContext()
  return <div style={{width: "400px"}}>
    <table>
      <tbody>
        <tr>
          <th>id</th>
          <th>Lat</th>
          <th>lng</th>
        </tr>
        {waypoints.map((i, id) => (
          <ListItem id={id} key={id}></ListItem>
        ))}

      </tbody>
    </table>
    
  </div>
}