import { Node } from "@/types/waypoints";
import { Mission } from "@/lib/mission/mission";
import { LatLng } from "@/lib/world/types";
import { Command, commands, filterLatLngCmds, LatLngAltCommand, LatLngCommand } from "@/lib/commands/commands";
import { avgLatLng } from "@/lib/world/distance";


export function MoveWPsAvgTo(pos: LatLng, waypoints: Mission, selectedWPs: number[], active: string): Mission {
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

  const avgll = avgLatLng(filterLatLngCmds(leaves).map(getLatLng))
  if (avgll == undefined) { return waypoints }
  const { lat, lng } = avgll
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
export function getLatLng<T extends Command>(cmd: T): T extends LatLngCommand ? LatLng : (LatLng | undefined) {
  if ("latitude" in cmd.params && "longitude" in cmd.params) {
    return { lat: cmd.params.latitude, lng: cmd.params.longitude }
  }
  else return undefined as T extends LatLngCommand ? LatLng : (LatLng | undefined);
}
