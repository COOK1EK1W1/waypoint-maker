"use client"
import { useWaypointContext } from "@/util/context/WaypointContext";
import ListItem from "./subListItem";
import { add_waypoint } from "@/util/WPCollection";
import { CollectionType, Node } from "@/types/waypoints";
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


  return (
    <div className="">
      {activeMission == "Main" ? <div className="flex">
      </div> : null}
      {Array.from(waypoints.keys()).map((waypoint, id)=>{
        const wp = waypoints.get(waypoint)
        if (wp != undefined){
          return <div key={id}><ListItem name={waypoint} nodes={wp} onMouseDown={()=>click(waypoint)} active={waypoint == activeMission} add={(e)=>addSub(e, waypoint)}/></div>
        }

      })}

    </div>

  )

}
