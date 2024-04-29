import { useWaypointContext } from "@/util/context/WaypointContext";
import ListItem from "./ListItem";

export default function MainMission(){
  const {waypoints, setSelectedWPs, selectedWPs } = useWaypointContext()

  const mainMission = waypoints.get("main")
  if (mainMission == null) return null
  function handleClick(id: number){
    setSelectedWPs([id])

  }

  return (
    <div>
      <h2>main mission</h2>
      {mainMission.map((waypoint, i) => {
        if (waypoint.type == "Collection"){
          return null

        }else{
          return <ListItem waypoint={waypoint.wps} id={i} selected={i == selectedWPs[0]} onClick={()=>handleClick(i)} key={i}/>
        }
      })}
    </div>
  )

}
