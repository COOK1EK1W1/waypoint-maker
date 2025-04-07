import { Node } from "@/types/waypoints";
import type { WaypointCollection } from "@/lib/waypoints/waypointCollection";
import { LatLng } from "@/lib/world/types";
import { Command, commands, filterLatLngCmds, LatLngAltCommand, LatLngCommand } from "@/lib/commands/commands";


export function MoveWPsAvgTo(pos: LatLng, waypoints: WaypointCollection, selectedWPs: number[], active: string): WaypointCollection {
  const mission = waypoints.get(active);

  let wps: Node[] = [];
  let wpsIds: number[] = [];
  if (selectedWPs.length === 0) {
    wps = mission;
    wpsIds = mission.map((_, index) => index);
  } else {
    wps = mission.filter((_, id) => selectedWPs.includes(id));
    wpsIds = selectedWPs;
  }

  const leaves = wps.map((x) => waypoints.flattenNode(x)).reduce((cur, acc) => (acc.concat(cur)), [])

  const { lat, lng } = avgLatLng(leaves)
  let waypointsUpdated = waypoints.clone();
  for (let i = 0; i < wps.length; i++) {
    waypointsUpdated.changeParam(wpsIds[i], active, (cmd: Command) => {
      if ("latitude" in cmd.params && "longitude" in cmd.params) {
        cmd.params.latitude += pos.lat - lat
        cmd.params.longitude += pos.lng - lng
      }
      return cmd;
    });
  }
  return waypointsUpdated;
}


export function avgLatLng(commands: Command[]): LatLng {
  let latTotal = 0
  let lngTotal = 0
  let count = 0
  const b = filterLatLngCmds(commands)
  for (let cmd of b) {
    let res = getLatLng(cmd)
    count += 1
    latTotal += res.lat
    lngTotal += res.lng
  }
  return { lat: latTotal / count, lng: lngTotal / count }
}

export function filter2d(cmds: Command[]) {
  return cmds.filter((x) => ("latitude" in x && "longitude" in x))
}

export function filter3d(cmds: Command[]) {
  return cmds.filter((x) => ("latitude" in x && "longitude" in x && "altitude" in x))
}

export function hasLocation(command: Command): boolean {
  const commanddesc = commands[commands.findIndex(a => a.value == command.type)]
  const hasLocationParams = commanddesc.parameters[4] &&
    commanddesc.parameters[5] &&
    commanddesc.parameters[4].label == "Latitude" &&
    commanddesc.parameters[5].label == "Longitude"
  return hasLocationParams || false
}

/* get the latitude and longitude of a mission command
 */
export function getLatLng(cmd: LatLngAltCommand): LatLng;
export function getLatLng(cmd: LatLngCommand): LatLng;
export function getLatLng(cmd: Command): LatLng | undefined;
export function getLatLng(cmd: Command): LatLng | undefined {
  if ("latitude" in cmd.params && "longitude" in cmd.params) {
    return { lat: cmd.params.latitude, lng: cmd.params.longitude }
  }
  else return undefined;
}
