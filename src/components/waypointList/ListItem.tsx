import { commands } from "@/util/commands";
import {commandName} from "@/util/translationTable"
import { Waypoint } from "@/types/waypoints";

export default function ListItem({waypoint, selected, onClick, onDelete}: {waypoint: Waypoint, selected: boolean, onClick: (e: React.MouseEvent<HTMLDivElement>)=>void, onDelete: ()=>void}){

  function remove(e: React.MouseEvent<HTMLButtonElement>){
    e.stopPropagation()
    onDelete()
  }

  return (
      <div className={`rounded p-2 m-2 border-grey border-2 cursor-pointer ${selected ? "bg-slate-200" : ""}`} onClick={onClick}>
        <span className="pl-2">{commandName(commands[commands.findIndex(a => a.value==waypoint.type)].name)}</span>
        <button className="pl-4" onClick={remove}>delete</button>

      </div>
      
  )

}
