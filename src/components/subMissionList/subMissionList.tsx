"use client"
import { useWaypointContext } from "@/util/context/WaypointContext";
import { add_waypoint } from "@/util/WPCollection";
import { CollectionType, Node } from "@/types/waypoints";
import ListItem from "../waypointList/ListItem";
import { TbFence, TbTopologyRing } from "react-icons/tb";
import { FaMapMarkedAlt } from "react-icons/fa";

const noAddNames = ["Main", "Geofence", "Takoeff", "Landing", "Markers"]

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
      {Array.from(waypoints.keys()).map((mission, id)=>{
        const wp = waypoints.get(mission)
        if (wp != undefined){
          const canAdd = !noAddNames.includes(mission)

          return <ListItem onMouseDown={()=>click(mission)} selected={activeMission == mission}>
            {mission == "Geofence" ? <span><TbFence className="inline m-1"/></span>
              : mission == "Markers" ? <span><FaMapMarkedAlt className="inline m-1"/></span>
                :<span><TbTopologyRing className="inline m-1"/></span>
            }
            {mission} ({wp.length})
            {canAdd ? <button onMouseDown={(e)=>addSub(e, mission)}>add</button> : null}
          </ListItem>
        }

      })}

    </div>

  )

}
