import { Node } from "@/types/waypoints";

export default function ListItem({name, nodes, onClick, active, add}: {name: string, nodes: Node[], onClick: ()=>void, active: boolean, add: (e: React.MouseEvent<HTMLButtonElement>)=>void}){
  return (
    <div onClick={onClick} className={`p-2 m-2 border rounded cursor-pointer border-2 ${active ? "bg-slate-200":"bg-slate-0"}`}>
      {name} ({nodes.length})
      <button onClick={(e)=>add(e)}>add</button>
    </div>
  )

}