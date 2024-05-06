import { ColNode } from "@/types/waypoints";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { TbTopologyRing } from "react-icons/tb";

export default function CollectionItem({node, selected, onClick, onDelete}: {node: ColNode, selected: boolean, onClick: (e: React.MouseEvent<HTMLDivElement>)=>void, onDelete: ()=>void}){
  const [expand, setExpand] = useState(false)
  const {waypoints} = useWaypointContext()

  function remove(e: React.MouseEvent<HTMLButtonElement>){
    e.stopPropagation()
    onDelete()
  }
  const wps = waypoints.get(node.collectionID)
  if (wps == undefined) return null

  return (
    <div className={`rounded p-2 m-2 border-grey border-2 cursor-pointer ${selected ? "bg-slate-200" : ""}`} onClick={onClick}>
      <div className="flex justify-between">
        <span><TbTopologyRing className="inline m-1"/>Group &apos;{node.name}&apos;</span>
        <button onClick={()=>{setExpand(!expand)}}>expand</button>
        <button className="pl-4" onClick={remove}><FaTrashAlt/></button>
      </div>
      <div className={`overflow-hidden duration-200 ${expand?`h-20`:`h-0`}`}>
        {wps.map((wp, id)=>(
          <div key={id}>
            {wp.type}
          </div>

        ))}

      </div>

    </div>

  )

}
