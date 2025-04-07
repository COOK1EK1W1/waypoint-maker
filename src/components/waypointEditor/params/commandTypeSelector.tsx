"use client"
import { commandName } from "@/util/translationTable";
import { Command, CommandName, commands } from "@/lib/commands/commands";
import { planeSupported } from "@/lib/commands/supported";
import { useWaypoints } from "@/util/context/WaypointContext";
import { WPNode } from "@/types/waypoints";
import { ChangeEvent } from "react";
import { coerceCommand } from "@/lib/commands/convert";
import { makeCommand } from "@/lib/commands/default";

export default function CommandTypeSelector() {
  const { activeMission, selectedWPs, waypoints, setWaypoints } = useWaypoints()

  const mission = waypoints.get(activeMission)
  let selected = selectedWPs.length == 0 ? mission : mission.filter((_, i) => selectedWPs.includes(i))
  let selectedIDs: number[] = []
  if (selectedWPs.length == 0) {
    for (let i = 0; i < mission.length; i++) {
      selectedIDs.push(i)
    }
  } else {
    selectedIDs = selectedWPs
  }


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
      for (let i = 0; i < selectedIDs.length; i++) {
        newWPs.changeParam(selectedIDs[i], activeMission, (cmd) => {
          let name = e.target.selectedOptions[0].getAttribute('data-cmd') as CommandName
          if (name === null) return cmd
          return coerceCommand(cmd, name) as Command
        })
      }

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
            <option key={index} data-cmd={cmd.name}>{commandName(cmd.name)}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
