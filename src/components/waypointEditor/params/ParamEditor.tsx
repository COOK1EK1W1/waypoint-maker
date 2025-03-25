import { useWaypoints } from "@/util/context/WaypointContext"
import { Node } from "@/types/waypoints";
import Parameter from "./Parameter";
import CommandTypeSelector from "./commandTypeSelector";
import { LatLngEditor } from "./LatLngEditor";
import { hasLocation } from "@/util/WPCollection";
import { Command, commands } from "@/lib/commands/commands";
import { CommandDescription } from "@/lib/commands/types";

function nodesAllSame(nodes: Node[]): boolean {
  let allSame = true;
  if (nodes[0].type == "Collection") return false
  const type = nodes[0].cmd.type
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i]
    if (a.type == "Collection") return false
    if (a.cmd.type != type) {
      allSame = false;
    }
  }
  return allSame

}

export default function ParamEditor() {
  const { activeMission, selectedWPs, waypoints, setWaypoints } = useWaypoints()

  const mission = waypoints.get(activeMission)

  let wps: Node[] = [];
  let wpsIds: number[] = [];
  if (selectedWPs.length === 0) {
    wps = mission;
    wpsIds = mission.map((_, index) => index);
  } else {
    wps = mission.filter((_, id) => selectedWPs.includes(id));
    wpsIds = selectedWPs;
  }

  if (wps.length == 0) {
    return <div className="h-full w-full text-center content-center">Select or place a waypoint to begin</div>
  }

  const allSame = nodesAllSame(wps);

  //on change function
  function changeInput(e: { target: { name?: string; value: number } }) {
    setWaypoints((waypoints) => {
      for (let i = 0; i < wpsIds.length; i++) {
        waypoints.changeParam(wpsIds[i], activeMission, (cmd: Command) => {
          let key = e.target.name as keyof Command;
          cmd[key] = Number(e.target.value)
          return cmd
        });
      }
      return waypoints.clone();
    })
  }

  //on change function
  function changeSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    setWaypoints((waypoints) => {
      for (let i = 0; i < wpsIds.length; i++) {
        waypoints.changeParam(wpsIds[i], activeMission, (cmd: Command) => {
          const newType = parseInt(e.target.selectedOptions[0].getAttribute('data-cmd') || '0', 10);
          cmd.type = newType
          return cmd
        });
      }
      return waypoints.clone();
    })
  }

  if (!allSame) {
    return <div className="w-full h-full">
      <div className=" text-center content-center py-4">Selected waypoints are of different types</div>
      <div className="flex flex-wrap">
        <LatLngEditor />
      </div>
    </div>
  }

  const commanddesc = commands[commands.findIndex(a => wps[0].type == "Command" && a.value == wps[0].cmd.type)] as CommandDescription

  const hasLocationParams = wps[0].type == "Command" && hasLocation(wps[0].cmd)

  return (
    <div className="flex-1 flex flex-wrap overflow-y-auto">
      <CommandTypeSelector change={changeSelect} wps={wps} allSame={allSame} />

      <Parameter param={commanddesc.parameters[0]} name="param1" change={changeInput} value={(x) => x.cmd.param1} wps={wps} />
      <Parameter param={commanddesc.parameters[1]} name="param2" change={changeInput} value={(x) => x.cmd.param2} wps={wps} />
      <Parameter param={commanddesc.parameters[2]} name="param3" change={changeInput} value={(x) => x.cmd.param3} wps={wps} />
      <Parameter param={commanddesc.parameters[3]} name="param4" change={changeInput} value={(x) => x.cmd.param4} wps={wps} />
      {!hasLocationParams && <Parameter param={commanddesc.parameters[4]} name="param5" change={changeInput} value={(x) => x.cmd.param5} wps={wps} />}
      {!hasLocationParams && <Parameter param={commanddesc.parameters[5]} name="param6" change={changeInput} value={(x) => x.cmd.param6} wps={wps} />}
      <Parameter param={commanddesc.parameters[6]} name="param7" change={changeInput} value={(x) => x.cmd.param7} wps={wps} />
      <LatLngEditor />
    </div>
  )
}
