import { useWaypointContext } from "../WaypointContext";

export default function ListItem({id}: {id: number}){
  const [waypoints, setWaypoints] = useWaypointContext()

  function bruh(){

    setWaypoints((prevWaypoints) =>{
      let newWaypoints = [...prevWaypoints]
      newWaypoints.splice(id, 1);
      return newWaypoints
    })
  }
  return (
    <tr>
      <td>{id}</td>
      <td>{waypoints[id].lat.toFixed(5)}</td>
      <td>{waypoints[id].lng.toFixed(5)}</td>
      <td><button onClick={bruh}>delete</button></td>
    </tr>
  )

}