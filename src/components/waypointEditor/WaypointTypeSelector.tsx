import { commandName } from "@/util/translationTable";
import { useWaypointContext } from "../../util/context/WaypointContext";
import { commands, planeSupported } from "@/util/commands";
import { Node } from "@/types/waypoints";



export default function WaypointTypeSelector({ wps, change, allSame }: { wps: Node[], change: (e: React.ChangeEvent<HTMLSelectElement>) => void, allSame: boolean }) {
  const { activeMission, waypoints } = useWaypointContext()

  const mission = waypoints.get(activeMission)
  if (mission == null) return null



  const active = wps[0]
  if (active.type != "Waypoint") return null

  return (
    <div className="p-2 flex flex-col">
      <label>
        <span className="block pl-[3.5px]">Type</span>
        <select className="w-40 h-[25px] border-slate-200 bg-slate-100" onChange={change} value={commandName(commands[commands.findIndex(a => a.value == active.wps.type)].name)} disabled={!allSame}>
          {commands.filter((x) => planeSupported.includes(x.name)).map((cmd, index) => (
            <option key={index} data-cmd={cmd.value}>{commandName(cmd.name)}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
