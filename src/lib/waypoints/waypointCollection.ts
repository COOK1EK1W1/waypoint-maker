import { Node, Waypoint, WaypointCollection } from "@/types/waypoints";

export class WaypointCollection2 {

  private collection: WaypointCollection

  constructor(collection?: WaypointCollection) {
    if (collection) {
      this.collection = collection
      return
    }
    this.collection = new Map();
    this.collection.set("Main", [])
    this.collection.set("Geofence", [])
    this.collection.set("Markers", [])
  }

  get(mission: string) {
    return this.collection.get(mission)
  }

  getMissions() {
    return this.collection.keys()
  }

  pushToMission(missionName: string, waypoint: Node) {
    const mission = this.collection.get(missionName)
    if (!mission) throw new MissingMission(missionName)
    mission.push(waypoint)
  }

  clone() {
    return new WaypointCollection2(this.collection)

  }

  flatten(mission: string) {
    let retlist: Waypoint[] = []
    const waypoints = this.collection.get(mission)
    if (waypoints === undefined) return []
    for (let i = 0; i < waypoints.length; i++) {
      const node = waypoints[i]
      switch (node.type) {
        case "Collection": {
          retlist = retlist.concat(this.flatten(node.collectionID))
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

  addSubMission(name: string, nodes: Node[] = []) {
    this.collection.set(name, nodes)
  }

  contains(missionName: string, A: string): boolean {
    const curWaypoints = this.collection.get(missionName)
    if (!curWaypoints) { throw new Error("No mission") }
    for (let wp of curWaypoints) {
      if (wp.type == "Collection") {
        if (wp.name == A) {
          return true
        }
        if (this.contains(wp.name, A)) return true
      }
    }
    return false
  }

  isRecursive(missionName: string = "Main") {
    return this.contains(missionName, missionName)
  }

  findNthPosition(missionName: string, n: number): [string, number] | undefined {
    const missionNodes = this.collection.get(missionName);

    if (missionNodes === undefined) {
      throw new MissingMission(missionName)
    }

    let count = 0;

    const findNth = (node: Node[], name: string): [string, number] | undefined => {
      for (let i = 0; i < node.length; i++) {
        const curNode = node[i];
        if (curNode.type === "Waypoint") {
          if (count === n) {
            return [name, i]; // Found nth waypoint
          }
          count++;
        } else if (curNode.type === "Collection") {
          const subMission = this.collection.get(curNode.collectionID);
          if (subMission !== undefined) {
            const result = findNth(subMission, curNode.collectionID);
            if (result !== null) {
              return result;
            }
          }
        }
      }
      return undefined; // Nth waypoint not found in this collection
    }

    return findNth(missionNodes, missionName);
  }

  pop(missionName: string, id?: number): Node | undefined {
    const mission = this.collection.get(missionName)
    if (!mission) throw new MissingMission(missionName)
    if (id !== undefined) {
      const wp = mission[id]
      mission.splice(id, 1)
      return wp
    }
    return mission.pop()
  }
}


export class MissingMission extends Error {
  constructor(missionName: string) {
    super(`Mission cannot be found: ${missionName}`)
    this.name = this.constructor.name
  }
}
