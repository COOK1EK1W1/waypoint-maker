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
    setWaypoints((prevWaypoints)=>{
      let newMission: Node[] = []
      let wps = prevWaypoints.set("Takeoff", newMission)
      let main = prevWaypoints.get("main")
      if (main == undefined) return prevWaypoints

      main.splice(0, 0, {type: "Collection", collectionID: "Takeoff", ColType:CollectionType.Mission, offsetLng: 0, offsetLat: 0, name: "Takeoff"})
      return new Map(wps)
    })

  }
  function createLanding(){
    setWaypoints((prevWaypoints)=>{
      let newMission: Node[] = []
      let wps = prevWaypoints.set("Landing", newMission)
      let main = prevWaypoints.get("main")
      if (main == undefined) return prevWaypoints
      main.push({type: "Collection", collectionID: "Landing", ColType:CollectionType.Mission, offsetLng: 0, offsetLat: 0, name: "Landing"})
      return new Map(wps)
    })
  }

  return (
    <div>
      <div className="flex">
        {hasTakeoff ? null: <Button onClick={createTakeoff}>Add Takeoff</Button>}
        {hasLanding ? null : <Button onClick={createLanding}>Add Landing</Button>}
      </div>
      {Array.from(waypoints.keys()).map((waypoint, id)=>{
        const wp = waypoints.get(waypoint)
        if (wp != undefined){
          return <div key={id}><ListItem name={waypoint} nodes={wp} onClick={()=>click(waypoint)} active={waypoint == activeMission} add={(e)=>addSub(e, waypoint)}/></div>
        }

      })}

    </div>

  )

}
