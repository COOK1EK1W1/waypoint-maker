import { useWaypoints } from "@/util/context/WaypointContext";
import Button from "../toolBar/button";
import { Locate, Route } from "lucide-react";

export default function CurEdit({ onHide }: { onHide: () => void }) {
  const { activeMission, selectedWPs, waypoints } = useWaypoints()

  let item = <span>
    <Locate className="inline m-1" /> 1 waypoint
  </span>
  if (selectedWPs.length == 0) {
    item = <span>
      <Route className="inline m-1" /> {activeMission} ({waypoints.get(activeMission).length})
    </span>
  } else if (selectedWPs.length > 1) {
    item = <span>
      <Route className="inline m-1" /> {selectedWPs.length} waypoints
    </span>


  }


  return (

    <div className="pl-2 pt-2 flex">
      <div className="flex flex-col">
        <Button onClick={onHide}>Hide</Button>
        <label className="mr-2"><span className="ml-[4px]">Editing</span>
          <div className="border-2 border-slate-200 rounded-lg w-40 flex overflow-hidden h-[25px]">
            {item}
          </div>
        </label>

      </div>
      <div className="bg-slate-200 h-full w-[2px]" />
    </div>
  )

}
