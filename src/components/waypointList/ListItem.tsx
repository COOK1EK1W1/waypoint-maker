import { useWaypointContext } from "../../util/context/WaypointContext";
import { commands } from "@/util/commands";
import {commandName} from "@/util/translationTable"

export default function ListItem({id}: {id: number}){
  const {waypoints, setWaypoints, setActive, active } = useWaypointContext()
  function open(){
    setActive(id)

  }

  function remove(e: React.MouseEvent<HTMLButtonElement>){
    e.stopPropagation()
      setActive((prevActive) => {
        if (prevActive == 0 || prevActive == null){
          return null
        }else{
          return prevActive - 1
        }
      })
    setWaypoints((prevWaypoints) =>{
      let newWaypoints = [...prevWaypoints]
      newWaypoints.splice(id, 1);
      return newWaypoints
    })
    
  }
  return (
      <div className={`rounded p-2 m-2 border-grey border-2 cursor-pointer ${active == id ? "bg-slate-200" : ""}`} onClick={open}>

        <span>{id}</span>
        <span className="pl-2">{commandName(commands[commands.findIndex(a => a.value==waypoints[id].type)].name)}</span>
        <button className="pl-4" onClick={remove}>delete</button>

      </div>
      
  )

}