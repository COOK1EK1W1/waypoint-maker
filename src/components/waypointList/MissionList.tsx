import { useWaypoints } from "@/util/context/WaypointContext";
import CreateCollection from "./createCollection";
import CollectionItem from "./collectionItem";
import ListItem from "./ListItem";
import { commandName } from "@/util/translationTable";
import { useState } from "react";
import { getCommandDesc } from "@/lib/commands/commands";
import { CollectionType } from "@/lib/mission/mission";
import { ArrowRight, Locate, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export default function MissionList({ onHide }: { onHide: () => void }) {
  const { setActiveMission, waypoints, setSelectedWPs, selectedWPs, setWaypoints, activeMission, setTool } = useWaypoints()
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const mainMission = waypoints.get(activeMission)

  function handleClick(id: number, e: React.MouseEvent<HTMLButtonElement>) {
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
      <h2 className="px-2 text-lg pb-0 justify-between flex">{activeMission}<button onMouseDown={onHide} name="hide"><ArrowRight className="w-6 h-6" /></button></h2>
      <div className="m-2 h-[2px] bg-slate-200"></div>

      {!hasTakeoff && activeMission == "Main" ?
        <div className="px-2 py-1">
          <Button name="Add Takeoff" onClick={createTakeoff} className="text-center w-full my-2 mx-0">
            Add Takeoff
          </Button>
        </div> : null
      }



      {mainMission.map((waypoint, i) => {
        if (waypoint.type == "Collection") {
          return <CollectionItem node={waypoint} selected={selectedWPs.includes(i)} onClick={(e) => handleClick(i, e)} key={i} onDelete={() => onDelete(i)} />

        } else {
          return (
            <ListItem name={commandName(getCommandDesc(waypoint.cmd.type).name)} icon={<Locate />} key={i} selected={selectedWPs.includes(i)} onClick={(e) => handleClick(i, e)} className="justify-start"
              menuItems={
                <>
                  <DropdownMenuItem onClick={() => onDelete(i)} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </>
              }
            />
          )
        }
      })}
      {selectedWPs.length > 1 && <CreateCollection />}

      {!hasLanding && activeMission == "Main" ?
        <div className="px-2 py-1">
          <Button onClick={createLanding} className="w-full my-2 mx-0">
            Add Landing
          </Button>
        </div> : null
      }
    </div>
  )

}
