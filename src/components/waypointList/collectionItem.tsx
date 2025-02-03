import { ColNode } from "@/types/waypoints";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { useState } from "react";
import { FaPlus, FaTrashAlt } from "react-icons/fa";
import { TbTopologyRing } from "react-icons/tb";
import ListItem from "./ListItem";

export default function CollectionItem({ node, selected, onMouseDown, onDelete }: { node: ColNode, selected: boolean, onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void, onDelete: () => void }) {
  const [expand, setExpand] = useState(false)
  const { waypoints } = useWaypointContext()

  function remove(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    onDelete()
  }
  const wps = waypoints.get(node.collectionID)
  if (wps == undefined) return null

  return (
    <ListItem onMouseDown={onMouseDown} selected={selected} actions={[
      (<button onMouseDown={() => { setExpand(!expand) }} key={2} name="expand"><FaPlus /></button>),
      (<button onMouseDown={remove} key={1} name="delete"><FaTrashAlt /></button>)
    ]}>
      <div className="flex justify-between">
        <span><TbTopologyRing className="inline m-1" />Group &apos;{node.name}&apos;</span>
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
