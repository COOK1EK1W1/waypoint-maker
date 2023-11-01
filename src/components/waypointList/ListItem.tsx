import { useWaypointContext } from "../WaypointContext";

export default function ListItem({id}: {id: number}){
  const {setWaypoints, setActive} = useWaypointContext()
  function open(){
    setActive(id)

  }

  function bruh(){

    setWaypoints((prevWaypoints) =>{
      let newWaypoints = [...prevWaypoints]
      newWaypoints.splice(id, 1);
      return newWaypoints
    })
  }
  return (
      <div className="rounded p-2 m-2 border-grey border-2 cursor-pointer" onClick={open}>

        <span>{id}</span>
        <span className="pl-2">Waypoint</span>
        <button className="pl-4" onClick={bruh}>delete</button>

      </div>
      
  )

}