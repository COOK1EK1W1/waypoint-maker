import { useWaypoints } from "@/util/context/WaypointContext";
import CreateCollection from "./createCollection";
import CollectionItem from "./collectionItem";
import ListItem from "./ListItem";
import { CollectionType } from "@/types/waypoints";
import { TfiTarget } from "react-icons/tfi";
import { commandName } from "@/util/translationTable";
import { FaArrowRight, FaTrashAlt } from "react-icons/fa";
import { useState } from "react";
import { commands } from "@/lib/commands/commands";

export default function MissionList({ onHide }: { onHide: () => void }) {
  const { setActiveMission, waypoints, setSelectedWPs, selectedWPs, setWaypoints, activeMission, setTool } = useWaypoints()
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const mainMission = waypoints.get(activeMission)

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
    setWaypoints((waypoints) => {
      const temp = waypoints.clone()
      const wp = waypoints.get(activeMission)[id]
      if (wp.type == "Collection" && ["Landing", "Takeoff"].includes(wp.name)) {
        temp.removeSubMission(wp.name)
      }
      temp.pop(activeMission, id)
      return temp
    })
    setSelectedWPs([])
  }

  const missions = Array.from(waypoints.getMissions())

  const hasLanding = missions.includes("Landing")
  const hasTakeoff = missions.includes("Takeoff")

  function createTakeoff() {

    setWaypoints((waypoints) => {
      const a = waypoints.clone()
      a.addSubMission("Takeoff", [])
      a.insert(0, "Main", { type: "Collection", collectionID: "Takeoff", ColType: CollectionType.Mission, offsetLng: 0, offsetLat: 0, name: "Takeoff" })
      return a
    })
    setActiveMission("Takeoff")
    setSelectedWPs([])
    setTool("Takeoff")
  }

  function createLanding() {
    setWaypoints((waypoints) => {
      const a = waypoints.clone()
      a.addSubMission("Landing", [])
      a.pushToMission("Main", { type: "Collection", collectionID: "Landing", ColType: CollectionType.Mission, offsetLng: 0, offsetLat: 0, name: "Landing" })
      return a
    })
    setActiveMission("Landing")
    setSelectedWPs([])
    setTool("Landing")
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
              <span><TfiTarget className="inline m-1" />{commandName(commands[commands.findIndex(a => a.value == waypoint.cmd.type)].name)}</span>
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
