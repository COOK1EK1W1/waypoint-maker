import { useWaypoints } from "@/util/context/WaypointContext";
import { useState } from "react";
import ListItem from "./ListItem";
import { ColNode } from "@/lib/mission/mission";
import { Plus, Route, Trash2 } from "lucide-react";

export default function CollectionItem({ node, selected, onClick, onDelete }: { node: ColNode, selected: boolean, onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, onDelete: () => void }) {
  const [expand, setExpand] = useState(false)
  const { waypoints } = useWaypoints()

  function remove(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    onDelete()
  }
  const wps = waypoints.get(node.collectionID)

  return (
    <ListItem onClick={onClick} selected={selected} actions={[
      (<button onMouseDown={() => { setExpand(!expand) }} key={2} name="expand"><Plus className="h-5 w-5" /></button>),
      (<button onMouseDown={remove} key={1} name="delete"><Trash2 className="h-5 w-5" /></button>)
    ]}>
      <div className="flex justify-between">
        <span><Route className="inline h-5 w-5 mx-1" />{node.name}</span>
      </div>
      <div className={`overflow-hidden duration-200 ${expand ? `h-20` : `h-0`}`}>
        {wps.map((wp, id) => (
          <div key={id}>
            {wp.type}
          </div>

        ))}

      </div>
    </ListItem>

  )

}
