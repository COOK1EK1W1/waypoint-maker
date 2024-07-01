import { useWaypointContext } from "@/util/context/WaypointContext";
import { TbTopologyRing } from "react-icons/tb";
import { TfiTarget } from "react-icons/tfi";

export default function CurEdit(){
  const {activeMission, selectedWPs, waypoints} = useWaypointContext()

  let item = <span>
    <TfiTarget className="inline m-1"/> 1 waypoint
  </span>
  if (selectedWPs.length == 0){
    item = <span>
      <TbTopologyRing className="inline m-1"/> {activeMission} ({waypoints.get(activeMission)?.length})
    </span>
  }else if(selectedWPs.length > 1){
    item =<span>
      <TbTopologyRing className="inline m-1"/> {selectedWPs.length} waypoints
    </span>


  }


  return (

    <div className="pl-2 pt-2 flex">
      <label className="mr-2"><span className="ml-[4px]">Editing</span>
        <div className="border-2 border-grey rounded-lg w-40 flex overflow-hidden h-[25px]">
          {item}
        </div>
      </label>
      <div className="bg-slate-200 h-full w-[2px]"/>
    </div>
  )

}
