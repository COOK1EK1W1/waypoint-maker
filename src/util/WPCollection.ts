
import { WaypointCollection, Waypoint, Node, ColNode } from "@/types/waypoints";
import { commands } from "./commands";

export function add_waypoint(missionName: string, waypoint: Node, waypoints: WaypointCollection): WaypointCollection{
  const mission = waypoints.get(missionName)
  if (mission == undefined) return waypoints
  mission.push(waypoint)
  let newMap = new Map(waypoints)
  newMap.set(missionName, mission)
  return newMap
}

export function get_waypoints(missionstr: string, store: WaypointCollection): Waypoint[]{
  let retlist: Waypoint[] = []
  const waypoints = store.get(missionstr)
  if (waypoints == undefined) return []
  for (let i = 0; i < waypoints.length; i++){
    const node = waypoints[i]
    switch (node.type){
      case "Collection":{
        retlist = retlist.concat(get_waypoints(node.collectionID, store))
        break
      }
      case "Waypoint":{
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

export function AvgLatLng(nodes: Node[], store: WaypointCollection): [number, number]{
  let latTotal = 0
  let lngTotal = 0
  let count = 0
  for (let i = 0; i < nodes.length; i++){
    const curNode = nodes[i]
    switch (curNode.type){
      case "Waypoint":{
        const commanddesc = commands[commands.findIndex(a => a.value==curNode.wps.type)]
        const hasLocationParams = commanddesc.parameters[4] && 
        commanddesc.parameters[5] &&
        commanddesc.parameters[4].label == "Latitude" &&
        commanddesc.parameters[5].label == "Longitude"
        if (hasLocationParams){
          count += 1
          latTotal += curNode.wps.param5
          lngTotal += curNode.wps.param6
        }
        break;
      }
      case "Collection":{
        const subCol = store.get(curNode.collectionID)
        if (subCol != undefined){
          const [subLat, subLng] = AvgLatLng(subCol, store)
          count += 1
          latTotal += subLat
          lngTotal += subLng
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

export function changeParam(id: number, mission: string, waypoints: WaypointCollection, mod: (wp: Waypoint)=>Waypoint){
  const curMission = waypoints.get(mission)
  if (curMission == undefined){return waypoints}
  let updatedWaypoint = { ...curMission[id]};
  if (updatedWaypoint.type == "Waypoint"){
    updatedWaypoint.wps = mod(updatedWaypoint.wps)
  }else{
    const col = waypoints.get(updatedWaypoint.collectionID)
    if (col != null){
    for (let i = 0; i < col.length; i++){
        changeParam(i, updatedWaypoint.collectionID, waypoints, mod)
      }
    }
  }
  curMission[id] = updatedWaypoint
  waypoints.set(mission, curMission)
  return waypoints;

}

export function deleteNode(id: number, mission: string, waypoints: WaypointCollection){
  const curMission = waypoints.get(mission)
  if (curMission == undefined){return waypoints}
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


export function MoveWPsAvgTo(newLat: number, newLng: number, waypoints: WaypointCollection, selectedWPs: number[], active: string): WaypointCollection{
  const mission: Node[] | undefined = waypoints.get(active);
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
  let waypointsUpdated = new Map(waypoints);
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
  return waypointsUpdated;
}

