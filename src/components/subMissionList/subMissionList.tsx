"use client"
import { useWaypointContext } from "@/util/context/WaypointContext";
import ListItem from "./subListItem";
export default function SubMissionList(){
  const {waypoints, activeMission} = useWaypointContext()

  return (
    <div>
      {Array.from(waypoints.keys()).map((waypoint)=>{
        const wp = waypoints.get(waypoint)
        if (wp != undefined){
          return <ListItem name={waypoint} nodes={wp} onClick={()=>{}} active={waypoint == activeMission}/>

        }

      })}

    </div>

  )

}
