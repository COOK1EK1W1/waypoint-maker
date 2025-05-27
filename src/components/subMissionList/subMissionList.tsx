"use client"
import { useWaypoints } from "@/util/context/WaypointContext";
import ListItem from "../waypointList/ListItem";
import { CollectionType } from "@/lib/mission/mission";
import { CornerLeftUp, Fence, MapPin, PlaneLanding, PlaneTakeoff, Route, Trash2 } from "lucide-react";
import { DropdownMenuItem } from "../ui/dropdown-menu";

const noAddNames = ["Main", "Geofence", "Takeoff", "Landing", "Markers"]

export default function SubMissionList() {
  const { waypoints, activeMission, setActiveMission, setWaypoints, setSelectedWPs } = useWaypoints()

  function addSub(name: string) {
    if (activeMission == name) return

    setWaypoints((waypoints) => {
      let newWaypoints = waypoints.clone()
      try {
        newWaypoints.pushToMission(activeMission, { type: "Collection", collectionID: name, name: name, ColType: CollectionType.Mission, offsetLat: 0, offsetLng: 0 })
        return newWaypoints
      } catch (err) {
        return waypoints
      }
    })
  }

  function click(wp: string) {
    setActiveMission(wp)
    setSelectedWPs([])
  }

  function clearMission(mission: string) {
    const a = confirm("Are you sure you want to clear")
    if (!a) return
    setWaypoints((prevWaypoints) => {
      const temp = prevWaypoints.clone()
      temp.set(mission, [])
      return temp
    })
  }

  function deleteMission(mission: string) {
    const a = confirm("Are you sure you want to delete")
    if (!a) return
    setActiveMission("Main")
    setWaypoints((prevWaypoints) => {
      const temp = prevWaypoints.clone()
      temp.removeSubMission(mission)
      return temp
    })
  }


  return (
    <div className="pb-1">
      <div className="w-full p-2">
        <div className="w-full h-[2px] bg-slate-200"></div>
      </div>
      {waypoints.getMissions().map((mission, id) => {
        const wp = waypoints.get(mission)
        const canAdd = !noAddNames.includes(mission)

        return (
          <ListItem name={`${mission} (${wp.length})`} icon={mission == "Geofence" ? <span><Fence /></span>
            : mission == "Markers" ? <span><MapPin /></span>
              : mission == "Landing" ? <span><PlaneLanding /></span>
                : mission == "Takeoff" ? <span><PlaneTakeoff /></span>
                  : <span><Route /></span>
          }
            className="justify-start" key={id} onClick={() => click(mission)} selected={activeMission == mission}
            menuItems={<>

              {canAdd ? (<DropdownMenuItem
                onClick={() => addSub(mission)}
                className="gap-2"
                disabled={activeMission === mission}
              >
                <CornerLeftUp className="h-4 w-4" />
                <span>Add to Mission</span>
              </DropdownMenuItem>) : null}

              {["Main", "Geofence", "Markers"].includes(mission) ? <DropdownMenuItem onClick={() => clearMission(mission)} className="gap-2 text-red-500 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
                <span>Clear</span>
              </DropdownMenuItem> :

                <DropdownMenuItem onClick={() => deleteMission(mission)} className="gap-2 text-red-500 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>}

            </>
            } />
        )
      })}
    </div>

  )

}
