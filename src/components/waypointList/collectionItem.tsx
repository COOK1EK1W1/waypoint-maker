import ListItem from "./ListItem";
import { ColNode } from "@/lib/mission/mission";
import { Route, Trash2 } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";


export default function CollectionItem({ node, selected, onClick, onDelete }: { node: ColNode, selected: boolean, onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, onDelete: () => void }) {

  function remove(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation()
    onDelete()
  }

  return (
    <ListItem icon={<Route />} name={node.name} onClick={onClick} selected={selected}
      menuItems={
        <>
          <DropdownMenuItem onClick={remove} className="gap-2">
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </>
      }
    />

  )

}
