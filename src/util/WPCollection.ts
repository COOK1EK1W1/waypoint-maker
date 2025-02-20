import { Waypoint, Node } from "@/types/waypoints";
import { commands } from "./commands";
import { WaypointCollection } from "@/lib/waypoints/waypointCollection";
import { LatLng } from "@/types/dubins";


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
    waypointsUpdated.changeParam(wpsIds[i], active, (wp: Waypoint) => {
      wp.param5 += pos.lat - lat
      wp.param6 += pos.lng - lng
      return wp;
    });
  }
  return waypointsUpdated;
}


export function isPointInPolygon(polygon: Waypoint[], point: Waypoint) {
  const num_vertices = polygon.length;
  const x = point.param5;
  const y = point.param6;
  let inside = false;

  let p1 = polygon[0];
  let p2;

  for (let i = 1; i <= num_vertices; i++) {
    p2 = polygon[i % num_vertices];

    if (y > Math.min(p1.param6, p2.param6)) {
      if (y <= Math.max(p1.param6, p2.param6)) {
        if (x <= Math.max(p1.param5, p2.param5)) {
          const x_intersection = ((y - p1.param6) * (p2.param5 - p1.param5)) / (p2.param6 - p1.param6) + p1.param5;

          if (p1.param5 === p2.param5 || x <= x_intersection) {
            inside = !inside;
          }
        }
      }
    }

    p1 = p2;
  }

  return inside;
}

export function avgLatLng(wps: Waypoint[]): LatLng {
  let latTotal = 0
  let lngTotal = 0
  let count = 0
  for (let wp of wps) {
    if (hasLocation(wp)) {
      count += 1
      latTotal += wp.param5
      lngTotal += wp.param6
    }
  }
  return { lat: latTotal / count, lng: lngTotal / count }
}

export function hasLocation(waypoint: Waypoint): boolean {
  const commanddesc = commands[commands.findIndex(a => a.value == waypoint.type)]
  const hasLocationParams = commanddesc.parameters[4] &&
    commanddesc.parameters[5] &&
    commanddesc.parameters[4].label == "Latitude" &&
    commanddesc.parameters[5].label == "Longitude"
  return hasLocationParams || false
}

export function getLatLng(wp: Waypoint): LatLng {
  return { lat: wp.param5, lng: wp.param6 }
}
