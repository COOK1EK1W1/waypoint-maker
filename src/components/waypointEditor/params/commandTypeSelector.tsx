"use client"
import { commandName } from "@/util/translationTable";
import { Command, CommandName, commands, getCommandDesc } from "@/lib/commands/commands";
import { planeSupported } from "@/lib/commands/supported";
import { useWaypoints } from "@/util/context/WaypointContext";
import { ChangeEvent } from "react";
import { coerceCommand } from "@/lib/commands/convert";

export default function CommandTypeSelector({ selected }: { selected: Command[] }) {
  const { activeMission, selectedWPs, waypoints, setWaypoints } = useWaypoints()

  const mission = waypoints.get(activeMission)
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
    types.add(x.type)
  })

  function onChange(e: ChangeEvent<HTMLSelectElement>) {
    setWaypoints((wps) => {
      const newWPs = wps.clone()
      newWPs.changeManyParams(selectedIDs, activeMission, (cmd) => {
        let name = e.target.selectedOptions[0].getAttribute('data-cmd') as CommandName
        if (name === null) return cmd
        return coerceCommand(cmd, name) as Command
      }, true)

      return newWPs
    })
  }

  return (
    <div className="p-2 flex flex-col">
      <label>
        <span className="block pl-[3.5px]">Type</span>
        <select className="w-40 h-[25px] border-input bg-card" onChange={onChange} value={types.size > 1 ? "" : commandName(getCommandDesc(selected[0].type).name)}>

          {types.size > 1 ? <option value="" disabled>--</option> : null}
          {commands.filter((x) => (planeSupported as readonly string[]).includes(x.name)).map((cmd, index) => (
            <option key={index} data-cmd={cmd.name}>{commandName(cmd.name)}</option>
          ))}
          {process.env.NEXT_PUBLIC_ALLOWDUBINS ? // remove when public
            <option data-cmd={"WM_CMD_NAV_DUBINS"}>Dubins</option> : null
          }
        </select>
      </label>
    </div>
  );
}
