import { useWaypoints } from "@/util/context/WaypointContext";
import ListItem from "./ListItem";
import { commandName } from "@/util/translationTable";
import { useState } from "react";
import { getCommandDesc } from "@/lib/commands/commands";
import { CollectionType } from "@/lib/mission/mission";
import { ArrowDownNarrowWide, ArrowRight, Locate, Route, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export default function CommandList({ onHide }: { onHide: () => void }) {
  const { setActiveMission, waypoints, setSelectedWPs, selectedWPs, setWaypoints, activeMission, setTool } = useWaypoints()
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const curMission = waypoints.get(activeMission)

  const missions = Array.from(waypoints.getMissions())

  const hasLanding = missions.includes("Landing")
  const hasTakeoff = missions.includes("Takeoff")

  function handleClick(id: number, e: React.MouseEvent<HTMLDivElement>) {
    if (e.shiftKey && lastSelectedIndex !== null) {
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

  // delete all selected waypoints
  function onDeleteSelected() {
    setWaypoints((mission) => {
      const temp = mission.clone()
      const minID = Math.min(...selectedWPs)
      const maxID = Math.max(...selectedWPs)

      const nodes = [...waypoints.get(activeMission)]
      for (const node of nodes) {
        if (node.type == "Collection" && ["Landing", "Takeoff"].includes(node.name)) {
          temp.removeSubMission(node.name)
        }
      }
      nodes.splice(minID, (maxID - minID) + 1)
      console.log(minID, maxID, (maxID - minID) + 1)
      temp.set(activeMission, nodes)
      return temp
    })
    setSelectedWPs([])
  }

  function goToSubMission(name: string) {
    setActiveMission(name)
    setSelectedWPs([])
  }


  function handleGroup() {
    // get name for mission
    let name: string | null = null
    name = prompt("enter name")
    if (name == null) return

    // remove all selected
    const newCmds = curMission.filter((_, id) => selectedWPs.includes(id))

    // get the nodes for sub mission
    const subMissionCmds = curMission.filter((_, id) => !selectedWPs.includes(id))

    // if _ at the start of the name, don't add to the main mission
    if (name.charAt(0) != '_') {
      subMissionCmds.splice(Math.min(...selectedWPs), 0, { type: "Collection", name: name, ColType: CollectionType.Mission, collectionID: name, offsetLng: 0, offsetLat: 0 })
      setSelectedWPs([Math.min(...selectedWPs)])
    } else {
      setSelectedWPs([])
    }

    // update the actual waypoints
    setWaypoints((waypoints) => {
      waypoints.set(activeMission, subMissionCmds)
      waypoints.set(name, newCmds)
      return waypoints.clone()
    })

  }


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
      <div className="m-2 h-[2px] bg-input"></div>

      {!hasTakeoff && activeMission == "Main" ?
        <div className="px-2 py-1">
          <Button name="Add Takeoff" onClick={createTakeoff} className="text-center w-full my-2 mx-0 h-12">
            Add Takeoff
          </Button>
        </div> : null
      }



      {curMission.map((node, i) => {
        if (node.type == "Collection") {

          return (
            <ListItem key={i} icon={<Route />} name={node.name} onClick={(e) => handleClick(i, e)} selected={selectedWPs.includes(i)}
              menuItems={
                <>
                  <DropdownMenuItem onClick={() => goToSubMission(node.name)} className="gap-2">
                    <ArrowDownNarrowWide className="h-4 w-4" />
                    <span>Go To Mission</span>
                  </DropdownMenuItem>

                  {selectedWPs.length > 1 ? <DropdownMenuItem onClick={() => handleGroup()} className="gap-2">
                    <Route className="h-4 w-4" />
                    <span>Group ({selectedWPs.length})</span>
                  </DropdownMenuItem> : null}

                  <DropdownMenuItem onClick={() => onDelete(i)} className="gap-2 text-red-500 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>

                  {selectedWPs.length > 1 ? <DropdownMenuItem onClick={() => onDeleteSelected()} className="gap-2 text-red-500 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete ({selectedWPs.length})</span>
                  </DropdownMenuItem> : null}
                </>
              }
            />
          )
        } else {

          return (
            <ListItem name={commandName(getCommandDesc(node.cmd.type).name)} icon={<Locate />} key={i} selected={selectedWPs.includes(i)} onClick={(e) => handleClick(i, e)} className="justify-start"
              menuItems={
                <>

                  {selectedWPs.length > 1 ? <DropdownMenuItem onClick={() => handleGroup()} className="gap-2">
                    <Route className="h-4 w-4" />
                    <span>Group ({selectedWPs.length})</span>
                  </DropdownMenuItem> : null}

                  <DropdownMenuItem onClick={() => onDelete(i)} className="gap-2 text-red-500 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>

                  {selectedWPs.length > 1 ? <DropdownMenuItem onClick={() => onDeleteSelected()} className="gap-2 text-red-500 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete ({selectedWPs.length})</span>
                  </DropdownMenuItem> : null}
                </>
              }
            />
          )
        }
      })}

      {selectedWPs.length > 1 ? (
        <div className="w-full flex justify-center">
          <Button variant="active" onMouseDown={handleGroup} className="text-center p-1 m-1 w-44">Group {selectedWPs.length} waypoints</Button>

        </div>
      ) : null}

      {!hasLanding && activeMission == "Main" ?
        <div className="px-2 py-1">
          <Button onClick={createLanding} className="w-full my-2 mx-0 h-12">
            Add Landing
          </Button>
        </div> : null
      }
    </div>
  )

}
