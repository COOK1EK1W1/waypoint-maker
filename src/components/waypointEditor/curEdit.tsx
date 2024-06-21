import { useWaypointContext } from "@/util/context/WaypointContext";

export default function CurEdit(){
  const {activeMission, selectedWPs, waypoints, setWaypoints} = useWaypointContext()
  if (selectedWPs.length == 0){
    return (
      <div className="bg-red-200">editing all Nodes in {activeMission}</div>
    )
  }else{
    return (
      <div className="bg-red-200">editing {selectedWPs.length} nodes from {activeMission}</div>
    )
  }

}
