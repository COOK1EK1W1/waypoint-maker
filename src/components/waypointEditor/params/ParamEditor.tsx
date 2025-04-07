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
  const selected = (selectedWPs.length == 0 ? mission : mission.filter((_, i) => selectedWPs.includes(i))).filter((x) => x.type == "Command")

  if (selected.length == 0) {
    return (
      <div className="flex-1 flex flex-wrap overflow-y-auto">
        Place or select a waypoint to edit parameters,
      </div>
    )
  }

  let params = new Set(Object.keys(selected[0].cmd.params))

  let vals = {}

  for (let i = 0; i < selected.length; i++) {
    params = params.intersection(new Set(Object.keys(selected[i].cmd.params)))
  }

  for (const key of Array.from(params)) {
    //@ts-ignore
    const values = selected.map(obj => obj.cmd.params[key]);
    const allSame = values.every(val => val === values[0]);

    //@ts-ignore
    vals[key] = allSame ? values[0] : null
  }

  function onChange(event: { target: { name: string, value: number } }) {
    setWaypoints((wps) => {
      const newWps = wps.clone()
      if (selectedWPs.length > 0) {
        selectedWPs.forEach((x) => {
          newWps.changeParam(x, activeMission, (cmd: any) => {
            cmd.params[event.target.name] = event.target.value
            return cmd
          })
        })
      } else {
        mission.forEach((_, i) => {
          newWps.changeParam(i, activeMission, (cmd: any) => {
            cmd.params[event.target.name] = event.target.value
            return cmd
          })
        })

      }
      return newWps
    })
  }


  return (
    <div className="flex-1 flex flex-wrap overflow-y-auto">
      <CommandTypeSelector />
      {Array.from(params).map((x, i) => {
        if (["longitude", "latitude"].includes(x)) {
          return
        }
        //@ts-ignore
        return (<Parameter key={i} name={x} value={vals[x]} onChange={onChange} />)
      }
      )}
      < LatLngEditor />

    </div>
  )
}
