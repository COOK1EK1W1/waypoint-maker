
import { WaypointCollection, Waypoint, WPNode } from "@/types/waypoints";
import { commands } from "./commands";

export function add_waypoint(missionName: string, waypoint: Waypoint, waypoints: WaypointCollection): WaypointCollection{
  const mission = waypoints.get(missionName)
  if (mission == undefined) return waypoints
  mission.push({type: "Waypoint", wps: waypoint})
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
        retlist.concat(get_waypoints(node.collectionID, store))
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

export function AvgLatLng(nodes: WPNode[], store: WaypointCollection): [number, number]{
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
