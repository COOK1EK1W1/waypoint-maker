import { Node, Waypoint } from "@/types/waypoints";

export class WaypointCollection {

  private collection: Map<string, Node[]>

  constructor(collection?: Map<string, Node[]>) {
    if (collection) {
      let newMap = new Map()
      for (let key of Array.from(collection.keys())) {
        let items = collection.get(key)
        if (!items) continue;
        newMap.set(key, [...items])
      }
      this.collection = new Map(newMap)
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

  set(mission: string, nodes: Node[]) {
    this.collection.set(mission, nodes)
  }

  getMissions() {
    return this.collection.keys()
  }

  pushToMission(missionName: string, waypoint: Node) {
    const mission = this.collection.get(missionName)
    if (!mission) throw new MissingMission(missionName)
    if (waypoint.type == "Collection") {
      if (this.contains(waypoint.name, missionName)) {
        throw new RecursiveMission()
      }

    }
    mission.push(waypoint)
  }

  clone() {
    return new WaypointCollection(this.collection)

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
        switch (curNode.type) {
          case "Waypoint": {
            if (count === n) {
              return [name, i]; // Found nth waypoint
            }
            count++;
            break
          }
          case "Collection": {
            const subMission = this.collection.get(curNode.collectionID);
            if (subMission !== undefined) {
              const result = findNth(subMission, curNode.collectionID);
              if (result !== undefined) {
                return result;
              }
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

  jsonify() {
    return JSON.stringify(Array.from(this.collection), null, 2)
  }

  insert(id: number, missionName: string, waypoint: Node) {

    const rec = (count: number, mission: string): number => {
      const curMission = this.collection.get(mission)
      if (!curMission) throw new MissingMission(mission)
      for (let i = 0; i < curMission.length; i++) {
        let cur = curMission[i]
        if (cur.type === "Collection") {
          count = rec(count, cur.collectionID)

        } else {
          if (count === id) {
            let newMission = curMission
            newMission.splice(i, 0, waypoint)
          }
          count++;
        }
      }
      return count
    }

    rec(0, missionName)
  }

  changeParam(id: number, missionName: string, mod: (wp: Waypoint) => Waypoint) {
    const curMission = this.collection.get(missionName)
    if (curMission == undefined) { throw new MissingMission(missionName) }

    let updatedWaypoint = curMission[id]

    if (updatedWaypoint.type === "Waypoint") {
      updatedWaypoint = {
        ...updatedWaypoint,
        wps: mod(updatedWaypoint.wps)
      }
    } else if (updatedWaypoint.type == "Collection") {
      const col = this.collection.get(updatedWaypoint.collectionID)
      if (col != null) {
        for (let i = 0; i < col.length; i++) {
          this.changeParam(i, updatedWaypoint.collectionID, mod)
        }
      }
    }
  }
}


export class MissingMission extends Error {
  constructor(missionName: string) {
    super(`Mission cannot be found: ${missionName}`)
    this.name = this.constructor.name
  }
}


export class RecursiveMission extends Error {
  constructor() {
    super(`Mission is recursive`)
    this.name = this.constructor.name
  }
}
