import { useWaypointContext } from "@/util/context/WaypointContext";
import { deleteNode } from "@/util/WPCollection";
import CreateCollection from "./createCollection";
import CollectionItem from "./collectionItem";
import ListItem from "./ListItem";
import { CollectionType, Node } from "@/types/waypoints";
import { TfiTarget } from "react-icons/tfi";
import { commandName } from "@/util/translationTable";
import { commands } from "@/util/commands";
import { FaArrowRight, FaTrashAlt } from "react-icons/fa";
import { useState } from "react";

export default function MissionList({ onHide }: { onHide: () => void }) {
  const { setActiveMission, waypoints, setSelectedWPs, selectedWPs, setWaypoints, activeMission, setTool } = useWaypointContext()
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const mainMission = waypoints.get(activeMission)
  if (mainMission == null) return null

  function handleClick(id: number, e: React.MouseEvent<HTMLDivElement>) {
    if (e.shiftKey && lastSelectedIndex !== null) {
      e.stopPropagation()
      const range = [lastSelectedIndex, id].sort((a, b) => a - b)
      const newSelection = []
      for (let i = range[0]; i <= range[1]; i++) newSelection.push(i)
      setSelectedWPs(newSelection)
    } else {
      setSelectedWPs([id])
      setLastSelectedIndex(id)
    }
  }

  function onDelete(id: number) {
    setWaypoints(deleteNode(id, activeMission, waypoints))
    setSelectedWPs([])
  }

  const hasLanding = Array.from(waypoints.keys()).includes("Landing")
  const hasTakeoff = Array.from(waypoints.keys()).includes("Takeoff")

  function createTakeoff() {
    let newMission: Node[] = []
    let wps = waypoints.set("Takeoff", newMission)
    let main = waypoints.get("Main")
    if (main == undefined) return waypoints

    main.splice(0, 0, { type: "Collection", collectionID: "Takeoff", ColType: CollectionType.Mission, offsetLng: 0, offsetLat: 0, name: "Takeoff" })
    setWaypoints(new Map(wps))
    setActiveMission("Takeoff")
    setSelectedWPs([])
    setTool("Takeoff")
  }

  function createLanding() {
    let newMission: Node[] = [{ type: "Waypoint", wps: { frame: 0, type: 189, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } }]
    let wps = waypoints.set("Landing", newMission)
    let main = waypoints.get("Main")
    if (main == undefined) return waypoints
    main.push({ type: "Collection", collectionID: "Landing", ColType: CollectionType.Mission, offsetLng: 0, offsetLat: 0, name: "Landing" })
    setWaypoints(new Map(wps))
    setActiveMission("Landing")
    setSelectedWPs([])
  }

  return (
    <div className="flex-grow overflow-auto select-none">
      <h2 className="px-2 text-lg pb-0 justify-between flex">{activeMission}<button onMouseDown={onHide} name="hide"><FaArrowRight className="w-6 h-6" /></button></h2>
      <div className="m-2 h-[1px] bg-slate-200"></div>

      {!hasTakeoff && activeMission == "Main" ?
        <ListItem onMouseDown={createTakeoff} className="text-center my-4">
          Add Takeoff
        </ListItem> : null
      }



      {mainMission.map((waypoint, i) => {
        if (waypoint.type == "Collection") {
          return <CollectionItem node={waypoint} selected={selectedWPs.includes(i)} onMouseDown={(e) => handleClick(i, e)} key={i} onDelete={() => onDelete(i)} />

        } else {
          return <ListItem key={i} selected={selectedWPs.includes(i)} onMouseDown={(e) => handleClick(i, e)} actions={[
            <button className="pl-4" onMouseDown={() => onDelete(i)} key={0} name="delete"><FaTrashAlt /></button>
          ]}>
            <div className="flex justify-between">
              <span><TfiTarget className="inline m-1" />{commandName(commands[commands.findIndex(a => a.value == waypoint.wps.type)].name)}</span>
            </div>
          </ListItem>
        }
      })}
      {selectedWPs.length > 1 && <CreateCollection />}

      {!hasLanding && activeMission == "Main" ?
        <ListItem onMouseDown={createLanding} className="text-center my-4">
          Add Landing
        </ListItem> : null
      }
    </div>
  )

}
