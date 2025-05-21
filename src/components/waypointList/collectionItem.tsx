import { useState } from "react";
import ListItem from "./ListItem";
import { ColNode } from "@/lib/mission/mission";
import { Plus, Route, Trash2 } from "lucide-react";

export default function CollectionItem({ node, selected, onClick, onDelete }: { node: ColNode, selected: boolean, onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, onDelete: () => void }) {
  const [expand, setExpand] = useState(false)

  function remove(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    onDelete()
  }

  return (
    <ListItem icon={<Route />} name={node.name} onClick={onClick} selected={selected} actions={[
      (<button onMouseDown={() => { setExpand(!expand) }} key={2} name="expand"><Plus className="h-5 w-5" /></button>),
      (<button onMouseDown={remove} key={1} name="delete"><Trash2 className="h-5 w-5" /></button>)
    ]}>
    </ListItem>

  )

}
