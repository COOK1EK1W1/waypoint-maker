import { useWaypoints } from "@/util/context/WaypointContext"
import { Node } from "@/types/waypoints";
import Parameter from "./Parameter";
import CommandTypeSelector from "./commandTypeSelector";
import { LatLngEditor } from "./LatLngEditor";
import { hasLocation } from "@/util/WPCollection";
import { Command, CommandName, CommandParams, CommandParamsNames, commands } from "@/lib/commands/commands";
import { CommandDescription } from "@/lib/commands/types";
import { objectKeys } from "@/util/types";
import { LatLng } from "leaflet";


export default function ParamEditor() {
  const { activeMission, selectedWPs, waypoints, setWaypoints } = useWaypoints()

  const mission = waypoints.get(activeMission)
  const selected = selectedWPs.length == 0 ? mission : mission.filter((_, i) => selectedWPs.includes(i))

  if (selected.length == 0) {
    return (
      <div className="flex-1 flex flex-wrap overflow-y-auto">
        Place or select a waypoint to edit parameters,
      </div>
    )
  }
  const cur = selected[0]
  if (cur.type == "Collection") {
    return (<div>not supported yet</div>)
  }

  const params = cur.cmd.params as any
  const keys = objectKeys(params) as ({ [K in CommandName]: (keyof CommandParams<K>)[] }[CommandName])

  function onChange(event: { target: { name: string, value: number } }) {
    setWaypoints((wps) => {
      const newWps = wps.clone()
      selectedWPs.forEach((x) => {
        newWps.changeParam(x, activeMission, (cmd: any) => {
          cmd.params[event.target.name] = event.target.value
          return cmd
        })
      })
      return newWps
    })
  }


  return (
    <div className="flex-1 flex flex-wrap overflow-y-auto">
      {keys.map((x, i) => {
        if (["altitude", "longitude", "latitude"].includes(x)) {
          return
        }
        return (<Parameter key={i} name={x} value={params[x]} onChange={onChange} />)
      }
      )}
      < LatLngEditor />

    </div>
  )
}
