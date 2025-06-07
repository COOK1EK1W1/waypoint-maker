import { useWaypoints } from "@/util/context/WaypointContext"
import Parameter from "./Parameter";
import CommandTypeSelector from "./commandTypeSelector";
import { LatLngEditor } from "./LatLngEditor";
import { CommandValue, getCommandDesc, } from "@/lib/commands/commands";

function findCommonParamsForTypes(cmdTypes: Set<CommandValue>): string[] {
  const a = Array.from(cmdTypes)
  if (a.length == 0) {
    return []
  }
  let params = new Set(getCommandDesc(a[0]).parameters.map(x => x?.label?.toLowerCase()).filter(x => x !== undefined))
  for (let i = 1; i < a.length; i++) {
    params = params.intersection(new Set(getCommandDesc(a[1]).parameters.map(x => x?.label?.toLowerCase()).filter(x => x !== undefined)))
  }
  return Array.from(params)
}

export default function ParamEditor() {
  const { activeMission, selectedWPs, waypoints, setWaypoints } = useWaypoints()

  const mission = waypoints.get(activeMission)
  const selected = (selectedWPs.length == 0 ? mission : mission.filter((_, i) => selectedWPs.includes(i))).map((x) => {
    if (x.type == "Command") {
      return [x.cmd]
    } else {
      return waypoints.flatten(x.name)
    }
  }).flat()

  if (selected.length == 0) {
    return <div className="h-full w-full text-center content-center"> Select or place a waypoint to begin </div>
  }

  let types = new Set(selected.map(x => x.type))
  const params = findCommonParamsForTypes(types)

  let vals = {}

  for (const key of params) {
    //@ts-ignore
    const values = selected.map(obj => obj.params[key]);
    const allSame = values.every(val => val === values[0]);

    //@ts-ignore
    vals[key] = allSame ? values[0] : null
  }

  function onChange(event: { target: { name: string, value: number } }) {
    setWaypoints((wps) => {
      const newWps = wps.clone()
      newWps.changeManyParams(selectedWPs.length === 0 ? mission.map((_, i) => i) : selectedWPs, activeMission, (cmd: any) => {
        cmd.params[event.target.name] = event.target.value
        return cmd
      }, true)
      return newWps
    })
  }


  return (
    <div className="flex-1 flex flex-wrap overflow-y-auto">
      <CommandTypeSelector selected={selected} />
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
