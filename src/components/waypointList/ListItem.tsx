import { useWaypointContext } from "../../util/context/WaypointContext";
import { commands } from "@/util/commands";
import {commandName} from "@/util/translationTable"
import { Waypoint } from "@/types/waypoints";

export default function ListItem({id, waypoint, selected, onClick}: {id: number, waypoint: Waypoint, selected: boolean, onClick:()=>void}){
  const {setSelectedWPs} = useWaypointContext()

  function remove(e: React.MouseEvent<HTMLButtonElement>){
    e.stopPropagation()
      setSelectedWPs((prevActive) => {
        return []
      })
  }

  if (typeof waypoint == "string") return
  
  return (
      <div className={`rounded p-2 m-2 border-grey border-2 cursor-pointer ${selected ? "bg-slate-200" : ""}`} onClick={onClick}>

        <span>{id}</span>
        <span className="pl-2">{commandName(commands[commands.findIndex(a => a.value==waypoint.type)].name)}</span>
        <button className="pl-4" onClick={remove}>delete</button>

      </div>
      
  )

}
