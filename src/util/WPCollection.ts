import { Waypoint, Node, WPNode } from "@/types/waypoints";
import { commands } from "./commands";
import { WaypointCollection } from "@/lib/waypoints/waypointCollection";

export function add_waypoint(missionName: string, waypoint: Node, waypoints: WaypointCollection): WaypointCollection {
  // add a waypoint to a mission

  const mission = waypoints.get(missionName)
  if (mission === undefined) {
    throw new Error(`Sub-mission ${missionName} does not exist`)

  }
  mission.push(waypoint)

  return waypoints.clone()
}

export function isRecursive(missionName: string, waypoints: WaypointCollection) {
  return contains(missionName, missionName, waypoints)

}

export function contains(missionName: string, A: string, waypoints: WaypointCollection) {
  const curWaypoints = waypoints.get(missionName)
  if (!curWaypoints) { return }
  for (let wp of curWaypoints) {
    if (wp.type == "Collection") {
      if (wp.name == A) {
        return true
      }
      if (contains(wp.name, A, waypoints)) return true
    }
  }
  return false
}

export function insert_waypoint(id: number, missionName: string, waypoint: WPNode, waypoints: WaypointCollection): WaypointCollection {

  function rec(count: number, mission: string): number {
    const curMission = waypoints.get(mission)
    if (!curMission) { return count }
    for (let i = 0; i < curMission.length; i++) {
      let cur = curMission[i]
      if (cur.type === "Collection") {
        count = rec(count, cur.collectionID)

      } else {
        if (count === id) {
          let newMission = curMission
          newMission.splice(i + 1, 0, waypoint)
        }
        count++;
      }
    }
    return count
  }

  rec(0, missionName)
  return waypoints.clone()
}


export function get_waypoints(missionstr: string, store: WaypointCollection): Waypoint[] {
  let retlist: Waypoint[] = []
  const waypoints = store.get(missionstr)
  if (waypoints === undefined) return []
  for (let i = 0; i < waypoints.length; i++) {
    const node = waypoints[i]
    switch (node.type) {
      case "Collection": {
        retlist = retlist.concat(get_waypoints(node.collectionID, store))
        break
      }
      case "Waypoint": {
        retlist.push(node.wps)
        break;
      }
      default: {
        const _exhaustiveCheck: never = node;
        return _exhaustiveCheck
      }
    }

  }
  return retlist

}

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

export function changeParam(id: number, mission: string, waypoints: WaypointCollection, mod: (wp: Waypoint) => Waypoint): WaypointCollection {
  const curMission = waypoints.get(mission)
  if (curMission == undefined) { return waypoints }

  let newMap = waypoints.clone()
  let updatedMission = [...curMission]
  let updatedWaypoint = { ...curMission[id] };

  if (updatedWaypoint.type === "Waypoint") {
    updatedWaypoint = {
      ...updatedWaypoint,
      wps: mod(updatedWaypoint.wps)
    }
    updatedMission[id] = updatedWaypoint
    newMap.set(mission, updatedMission)
  } else if (updatedWaypoint.type == "Collection") {
    const col = waypoints.get(updatedWaypoint.collectionID)
    if (col != null) {
      let newColMap = waypoints.clone()
      for (let i = 0; i < col.length; i++) {
        newColMap = changeParam(i, updatedWaypoint.collectionID, waypoints, mod)
      }
      newMap = newColMap
    }
  }
  //curMission[id] = updatedWaypoint
  //newMap.set(mission, updatedMission)
  return newMap;

}

export function deleteNode(id: number, mission: string, waypoints: WaypointCollection) {
  const curMission = waypoints.get(mission)
  if (curMission == undefined) { return waypoints }
  curMission.splice(id, 1)
  waypoints.set(mission, curMission)
  return waypoints;
}

export function findnthwaypoint(mission: string, n: number, waypoints: WaypointCollection): [string, number] | null {
  const missionNodes = waypoints.get(mission);

  if (missionNodes === undefined) {
    return null; // Mission not found
  }

  let count = 0;

  function findNth(node: Node[], name: string): [string, number] | null {
    for (let i = 0; i < node.length; i++) {
      const curNode = node[i];
      if (curNode.type === "Waypoint") {
        if (count === n) {
          return [name, i]; // Found nth waypoint
        }
        count++;
      } else if (curNode.type === "Collection") {
        const subMission = waypoints.get(curNode.collectionID);
        if (subMission !== undefined) {
          const result = findNth(subMission, curNode.collectionID);
          if (result !== null) {
            return result;
          }
        }
      }
    }
    return null; // Nth waypoint not found in this collection
  }

  return findNth(missionNodes, mission);
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
    waypointsUpdated = changeParam(wpsIds[i], active, waypointsUpdated, (wp: Waypoint) => {
      if (newLng == null || newLat == null) {
        return wp;
      }
      wp.param5 += (Number(newLat) - lat);
      wp.param6 += (Number(newLng) - lng);
      return wp;
    });
  }
  return waypoints.clone();
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
