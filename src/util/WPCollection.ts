import { Waypoint, Node } from "@/types/waypoints";
import { commands } from "./commands";
import { WaypointCollection } from "@/lib/waypoints/waypointCollection";


export function AvgLatLng(nodes: Node[], store: WaypointCollection): [number, number] {
  let latTotal = 0
  let lngTotal = 0
  let count = 0
  for (let i = 0; i < nodes.length; i++) {
    const curNode = nodes[i]
    switch (curNode.type) {
      case "Waypoint": {
        if (hasLocation(curNode.wps)) {
          count += 1
          latTotal += curNode.wps.param5
          lngTotal += curNode.wps.param6
        }
        break;
      }
      case "Collection": {
        const subCol = store.get(curNode.collectionID)
        if (subCol != undefined) {
          const [subLat, subLng] = AvgLatLng(subCol, store)
          count += subCol.length
          latTotal += subLat * subCol.length
          lngTotal += subLng * subCol.length
        }
        break
      }
      default: {
        const _exhaustiveCheck: never = curNode;
        return _exhaustiveCheck
      }
    }
  }
  return [latTotal / count, lngTotal / count]
}

export function MoveWPsAvgTo(newLat: number, newLng: number, waypoints: WaypointCollection, selectedWPs: number[], active: string): WaypointCollection {
  const mission = waypoints.get(active);
  if (!mission) return waypoints;

  let wps: Node[] = [];
  let wpsIds: number[] = [];
  if (selectedWPs.length === 0) {
    wps = mission;
    wpsIds = mission.map((_, index) => index);
  } else {
    wps = mission.filter((_, id) => selectedWPs.includes(id));
    wpsIds = selectedWPs;
  }

  const [lat, lng] = AvgLatLng(wps, waypoints);
  let waypointsUpdated = waypoints.clone();
  for (let i = 0; i < wps.length; i++) {
    waypointsUpdated.changeParam(wpsIds[i], active, (wp: Waypoint) => {
      wp.param5 += newLat - lat
      wp.param6 += newLng - lng
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

export function avgLatLng(wps: Waypoint[]): { lat: number, lng: number } {

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
