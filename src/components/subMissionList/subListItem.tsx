import { WPNode } from "@/types/waypoints";

export default function ListItem({name, nodes, onClick, active}: {name: string, nodes: WPNode[], onClick: ()=>void, active: boolean}){
  return <div onClick={onClick}>{name} ({nodes.length})</div>

}
