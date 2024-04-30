import { WPNode, Waypoint } from "@/types/waypoints";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { useState } from "react";

export default function CollectionItem({node, selected, onClick, onDelete}: {node: WPNode, selected: boolean, onClick: (e: React.MouseEvent<HTMLDivElement>)=>void, onDelete: ()=>void}){
  const [expand, setExpand] = useState(false)
  const {waypoints} = useWaypointContext()

  function remove(e: React.MouseEvent<HTMLButtonElement>){
    e.stopPropagation()
    onDelete()
  }
  if (node.type != "Collection") return
  const wps = waypoints.get(node.collectionID)
  if (wps == undefined) return null

  return (
    <div className={`rounded p-2 m-2 border-grey border-2 cursor-pointer ${selected ? "bg-slate-200" : ""}`} onClick={onClick}>
      <span className="pl-2">Group &apos;{node.name}&apos;</span>
      <button className="pl-4" onClick={remove}>delete</button>
      <button onClick={()=>{setExpand(!expand)}}>expand</button>
      <div className={`overflow-hidden ${expand?`h-20`:`h-0`}`}>
        {wps.map((wp)=>(
          <div>
            {wp.type}
          </div>

        ))}

      </div>

    </div>

  )

}
