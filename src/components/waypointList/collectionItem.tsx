import { useWaypoints } from "@/util/context/WaypointContext";
import { useState } from "react";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { TbTopologyRing } from "react-icons/tb";
import ListItem from "./ListItem";
import { ColNode } from "@/lib/mission/mission";

export default function CollectionItem({ node, selected, onMouseDown, onDelete }: { node: ColNode, selected: boolean, onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void, onDelete: () => void }) {
  const [expand, setExpand] = useState(false)
  const { waypoints } = useWaypoints()

  function remove(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    onDelete()
  }
  const wps = waypoints.get(node.collectionID)

  return (
    <ListItem onMouseDown={onMouseDown} selected={selected} actions={[
      (<button onMouseDown={() => { setExpand(!expand) }} key={2} name="expand"><FaPlus /></button>),
      (<button onMouseDown={remove} key={1} name="delete"><FaTrashAlt /></button>)
    ]}>
      <div className="flex justify-between">
        <span><TbTopologyRing className="inline m-1" />{node.name}</span>
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
