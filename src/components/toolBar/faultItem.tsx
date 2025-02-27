import { Fault, Severity } from "@/types/waypoints";
import { useWaypoints } from "@/util/context/WaypointContext";
import { cn } from "@/lib/utils";

export default function FaultItem({ fault, onMouseDown }: { fault: Fault, onMouseDown: () => void }) {
  const { setSelectedWPs, setActiveMission } = useWaypoints()

  function dostuff(mission: string | undefined, id: number | undefined) {
    if (id) {
      setSelectedWPs([id])
    } else {
      setSelectedWPs([])
    }
    setActiveMission(mission || "Main")
    onMouseDown()
  }

  let bg = ""
  switch (fault.severity) {

    case Severity.Med: {
      bg = "bg-amber-200 border-amber-300"
      break;
    }
    case Severity.Bad: {
      bg = "bg-red-200 border-red-300"
      break;
    }
    case Severity.Good: {
      bg = "bg-green-200 border-green-300"
      break;
    }
    default: {
      const _exhaustiveCheck: never = fault.severity
      return _exhaustiveCheck
    }
  }

  return (
    <div className={cn("p-2 flex flex-row justify-between border-2 rounded-lg my-2", bg)}>
      {fault.message}
      {(fault.offenderMission !== undefined) && (
        <button onMouseDown={() => dostuff(fault.offenderMission, fault.offenderIndex)} className="bg-slate-200 p-2 m-1 rounded-lg">Go To</button>
      )}
    </div>

  )

}
