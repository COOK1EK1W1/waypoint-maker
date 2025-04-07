"use client"
import { commandName } from "@/util/translationTable";
import { Command, CommandName, commands } from "@/lib/commands/commands";
import { planeSupported } from "@/lib/commands/supported";
import { useWaypoints } from "@/util/context/WaypointContext";
import { WPNode } from "@/types/waypoints";
import { ChangeEvent } from "react";

export default function CommandTypeSelector() {
  const { activeMission, selectedWPs, waypoints, setWaypoints } = useWaypoints()

  const mission = waypoints.get(activeMission)
  let selected = selectedWPs.length == 0 ? mission : mission.filter((_, i) => selectedWPs.includes(i))


  console.assert(selected.length > 0, "command type selector with 0 selected :(")

  const types: Set<number> = new Set();
  selected.forEach((x) => {
    if (x.type == "Command") {
      types.add(x.cmd.type)
    }
  })

  let nodes = selected as WPNode[]

  function onChange(e: ChangeEvent<HTMLSelectElement>) {
    setWaypoints((wps) => {
      const newWPs = wps.clone()
      selectedWPs.forEach((x) => {

        newWPs.changeParam(x, activeMission, (x) => {
          x.type = parseInt(e.target.selectedOptions[0].getAttribute('data-cmd') || '0', 10) as Command["type"];
          return x

        })
      })

      return newWPs
    })
  }

  return (
    <div className="p-2 flex flex-col">
      <label>
        <span className="block pl-[3.5px]">Type</span>
        <select className="w-40 h-[25px] border-slate-200 bg-slate-100" onChange={onChange} value={types.size > 1 ? "" : commandName(commands[commands.findIndex(a => a.value == nodes[0].cmd.type)].name)}>

          {types.size > 1 ? <option value="" disabled>--</option> : null}
          {commands.filter((x) => (planeSupported as readonly string[]).includes(x.name)).map((cmd, index) => (
            <option key={index} data-cmd={cmd.value}>{commandName(cmd.name)}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
