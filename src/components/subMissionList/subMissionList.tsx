"use client"
import { useWaypointContext } from "@/util/context/WaypointContext";
import ListItem from "./subListItem";
import { add_waypoint } from "@/util/WPCollection";
import { CollectionType, Node } from "@/types/waypoints";
import Button from "./buttonthing";
export default function SubMissionList(){
  const {waypoints, activeMission, setActiveMission, setWaypoints, setSelectedWPs} = useWaypointContext()

  function addSub(e: React.MouseEvent<HTMLButtonElement>, name: string){
    e.stopPropagation()
    if (activeMission != name)
    setWaypoints(add_waypoint(activeMission, {type: "Collection", collectionID: name, name: name, ColType: CollectionType.Mission, offsetLat: 0, offsetLng: 0}, waypoints))
  }

  function click(wp:string){
    setActiveMission(wp)
    setSelectedWPs([])
  }

  const hasLanding = Array.from(waypoints.keys()).includes("Landing")
  const hasTakeoff = Array.from(waypoints.keys()).includes("Takeoff")

  function createTakeoff(){
    let newMission: Node[] = []
    let wps = waypoints.set("Takeoff", newMission)
    let main = waypoints.get("Main")
    if (main == undefined) return waypoints

    main.splice(0, 0, {type: "Collection", collectionID: "Takeoff", ColType:CollectionType.Mission, offsetLng: 0, offsetLat: 0, name: "Takeoff"})
    setWaypoints(new Map(wps))
    setActiveMission("Takeoff")
  }

  function createLanding(){
    let newMission: Node[] = []
    let wps = waypoints.set("Landing", newMission)
    let main = waypoints.get("Main")
    if (main == undefined) return waypoints
    main.push({type: "Collection", collectionID: "Landing", ColType:CollectionType.Mission, offsetLng: 0, offsetLat: 0, name: "Landing"})
    setWaypoints(new Map(wps))
    setActiveMission("Landing")
  }

  return (
    <div className="">
      {activeMission == "Main" ? <div className="flex">
        {hasTakeoff ? null: <Button onClick={createTakeoff}>Add Takeoff</Button>}
        {hasLanding ? null : <Button onClick={createLanding}>Add Landing</Button>}
      </div> : null}
      {Array.from(waypoints.keys()).map((waypoint, id)=>{
        const wp = waypoints.get(waypoint)
        if (wp != undefined){
          return <div key={id}><ListItem name={waypoint} nodes={wp} onClick={()=>click(waypoint)} active={waypoint == activeMission} add={(e)=>addSub(e, waypoint)}/></div>
        }

      })}

    </div>

  )

}
