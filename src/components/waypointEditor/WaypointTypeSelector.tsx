import { commandName } from "@/util/translationTable";
import { useWaypointContext } from "../../util/context/WaypointContext";
import { commands } from "@/util/commands";
import { changeParam } from "@/util/WPCollection";



export default function WaypointTypeSelector(){
  const {activeMission, waypoints, setWaypoints, selectedWPs} = useWaypointContext()

  const mission = waypoints.get(activeMission)
  if (mission == null) return null

  if (selectedWPs.length != 1) return null
  const active = selectedWPs[0]
  const activeNode = mission[active]
  if (activeNode.type != "Waypoint")return null
  
  function bruh(e :React.ChangeEvent<HTMLSelectElement>){
    const newType = parseInt(e.target.selectedOptions[0].getAttribute('data-cmd') || '0', 10);

    // Update the waypoints with the new type for the active waypoint
    setWaypoints((prevWaypoints) => {
      const a = changeParam(active, activeMission, prevWaypoints, (wp)=>{wp.type=newType;return wp})
      return new Map(a)
    })
  }
  commands[commands.findIndex(a => a.value==activeNode.wps.type)].name

  return (
    <div>
      <select onChange={bruh} value={  commandName(commands[commands.findIndex(a => a.value==activeNode.wps.type)].name)}>
        {commands.map((cmd, index) => (
          <option key={index} data-cmd={cmd.value}>{commandName(cmd.name)}</option>
        ))}
      </select>
    </div>
  );
}
