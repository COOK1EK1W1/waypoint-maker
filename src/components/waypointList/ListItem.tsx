import { commands } from "@/util/commands";
import {commandName} from "@/util/translationTable"
import { Waypoint } from "@/types/waypoints";
import { TfiTarget } from "react-icons/tfi";
import { FaTrashAlt } from "react-icons/fa";

export default function ListItem({waypoint, selected, onClick, onDelete}: {waypoint: Waypoint, selected: boolean, onClick: (e: React.MouseEvent<HTMLDivElement>)=>void, onDelete: ()=>void}){

  function remove(e: React.MouseEvent<HTMLButtonElement>){
    e.stopPropagation()
    onDelete()
  }

  return (
      <div className={`rounded p-2 m-2 border-grey border-2 cursor-pointer flex justify-between ${selected ? "bg-slate-200" : ""}`} onClick={onClick}>
        <span><TfiTarget className="inline m-1"/>{commandName(commands[commands.findIndex(a => a.value==waypoint.type)].name)}</span>
        <button className="pl-4" onClick={remove}><FaTrashAlt/></button>

      </div>
      
  )

}
