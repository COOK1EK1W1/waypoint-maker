import { Node } from "@/types/waypoints";

export default function ListItem({name, nodes, onMouseDown, active, add}: {name: string, nodes: Node[], onMouseDown: ()=>void, active: boolean, add: (e: React.MouseEvent<HTMLButtonElement>)=>void}){
  const canAdd = name != "Main" && name != "Geofence" && name != "Takeoff" && name != "Landing"
  return (
    <div onMouseDown={onMouseDown} className={`p-2 m-2 border rounded cursor-pointer border-2 ${active ? "bg-slate-200":"bg-slate-0"}`}>
      {name} ({nodes.length})
      {canAdd ? <button onMouseDown={(e)=>add(e)}>add</button> : null}
    </div>
  )

}
