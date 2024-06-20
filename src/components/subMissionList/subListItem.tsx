import { Node } from "@/types/waypoints";

const noAddNames = ["Main", "Geofence", "Takoeff", "Landing", "Markers"]
export default function ListItem({name, nodes, onMouseDown, active, add}: {name: string, nodes: Node[], onMouseDown: ()=>void, active: boolean, add: (e: React.MouseEvent<HTMLButtonElement>)=>void}){
  const canAdd = !noAddNames.includes(name)

  return (
    <div onMouseDown={onMouseDown} className={`p-2 m-2 border rounded cursor-pointer border-2 ${active ? "bg-slate-200":"bg-slate-0"}`}>
      {name} ({nodes.length})
      {canAdd ? <button onMouseDown={(e)=>add(e)}>add</button> : null}
    </div>
  )

}
