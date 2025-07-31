import { Command, filterLatLngCmds, getCommandDesc, LatLngAltCommand } from "@/lib/commands/commands";
import { getLatLng, LatLng } from "../world/latlng";

export enum CollectionType {
  Mission,
  Overlay,
  Geofence
}

export type WPNode<T extends Command> = {
  type: "Command"
  cmd: T
}

export type ColNode = {
  type: "Collection"
  name: string
  ColType: CollectionType
  collectionID: string
  offsetLat: number
  offsetLng: number
}

export type Node<T extends Command = Command> = WPNode<T> | ColNode
export class Mission {

  private collection: Map<string, Node[]>

  destructure() {
    return this.collection;
  }

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

  getReferencePoint(): LatLng {
    const wps = filterLatLngCmds(this.flatten("Main"))
    for (let wp of wps) {
      return getLatLng(wp)
    }
    return { lat: 0, lng: 0 }
  }

  get(mission: string): Node[] {
    const a = this.collection.get(mission)
    if (a === undefined) {
      throw new MissingMission(mission)
    }
    return a
  }

  set(mission: string, nodes: Node[]) {
    this.collection.set(mission, nodes)
  }

  getMissions() {
    return Array.from(this.collection.keys())
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
    return new Mission(this.collection)

  }

  flatten(mission: string) {
    let retList: Command[] = []
    const waypoints = this.collection.get(mission)
    if (waypoints === undefined) return []
    for (let i = 0; i < waypoints.length; i++) {
      retList = retList.concat(this.flattenNode(waypoints[i]))

    }
    return retList
  }

  flattenNode(node: Node) {
    let retList: Command[] = []
    switch (node.type) {
      case "Collection": {
        retList = retList.concat(this.flatten(node.collectionID))
        break
      }
      case "Command": {
        retList.push(node.cmd)
        break;
      }
      default: {
        const _exhaustiveCheck: never = node;
        return _exhaustiveCheck
      }
    }
    return retList
  }

  addSubMission(name: string, nodes: Node[] = []) {
    this.collection.set(name, nodes)
  }

  removeSubMission(name: string) {
    this.collection.delete(name)

    // loop over all sub missions
    for (const missionKey of Array.from(this.collection.keys())) {
      const currentMissionNodes = this.collection.get(missionKey);
      if (currentMissionNodes) {
        const filteredNodes = currentMissionNodes.filter(node => {
          if (node.type === "Collection") {
            return node.collectionID !== name;
          }
          return true;
        });
        this.collection.set(missionKey, filteredNodes);
      }
    }
  }

  contains(missionName: string, A: string): boolean {
    const curWaypoints = this.collection.get(missionName)
    if (!curWaypoints) { throw new Error(`No mission: ${missionName}`) }
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

  /**
   * Finds the nth command's position of a flattened mission.
   * @param missionName - The name of the mission to search in.
   * @param n - The index of the waypoint to find.
   * @returns A tuple containing the mission name and the index of the waypoint, or undefined if the waypoint is not found.
   */
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
          case "Command": {
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

      if (count === id) {
        curMission.splice(0, 0, waypoint)
        return count
      }

      for (let i = 0; i < curMission.length; i++) {
        if (count === id) {
          curMission.splice(i, 0, waypoint)
          return count
        }
        let cur = curMission[i]
        if (cur.type === "Collection") {
          count = rec(count, cur.collectionID)
        } else {
          count++;
        }
      }
      return count
    }

    rec(0, missionName)
  }

  findAllSubMissions(missionName: string): Set<string> {
    let names = new Set<string>()
    const cur = this.collection.get(missionName)
    if (!cur) throw new MissingMission(missionName)
    cur.forEach((x) => {
      if (x.type == "Collection") {
        names.add(x.name)
        names = names.union(this.findAllSubMissions(x.name))
      }
    })
    return names
  }

  /**
   * Changes a single parameter in a mission at the specified index.
   * @param id - The index of the command from the mission to modify
   * @param missionName - The name of the mission containing the command
   * @param mod - A function that takes a Command and returns a modified Command
   * @param recurse - If true and the target is a Collection, recursively apply changes to all commands in the collection
   * @throws {MissingMission} If the specified mission does not exist
   */
  changeParam(id: number, missionName: string, mod: (cmd: Command) => Command, recurse?: boolean) {
    const curMission = this.collection.get(missionName)
    if (curMission == undefined) { throw new MissingMission(missionName) }

    let updatedWaypoint = curMission[id]

    if (curMission[id].type === "Command") {
      curMission[id] = {
        ...curMission[id],
        cmd: mod(curMission[id].cmd)
      }
    } else if (updatedWaypoint.type == "Collection" && recurse) {
      const col = this.collection.get(updatedWaypoint.collectionID)
      if (col != null) {
        for (let i = 0; i < col.length; i++) {
          this.changeAllParams(updatedWaypoint.collectionID, mod)
        }
      }
    }
  }

  /**
   * Changes parameters for multiple commands in a mission.
   * @param ids - Array of indices of commands from the mission to modify
   * @param missionName - The name of the mission containing the commands
   * @param mod - A function that takes a Command and returns a modified Command
   * @param recurse - If true and any target is a Collection, recursively apply changes to all commands in those collections
   * @throws {MissingMission} If the specified mission does not exist
   */
  changeManyParams(ids: number[], missionName: string, mod: (cmd: Command) => Command, recurse?: boolean) {
    let names = new Set<string>()
    const cur = this.collection.get(missionName)
    if (!cur) throw new MissingMission(missionName)
    for (let x of ids) {
      if (cur[x].type == "Command") {
        this.changeParam(x, missionName, mod)
      } else if (cur[x].type == "Collection" && recurse) {
        names = names.add(cur[x].name)
        names = names.union(this.findAllSubMissions(cur[x].name))
      }
    }
    if (recurse) names.forEach(x => this.changeAllParams(x, mod, false))
  }

  /**
   * Changes parameters for all commands in a mission.
   * @param missionName - The name of the mission to modify
   * @param mod - A function that takes a Command and returns a modified Command
   * @param recurse - If true, recursively apply changes to all commands in sub-missions
   * @throws {MissingMission} If the specified mission does not exist
   */
  changeAllParams(missionName: string, mod: (cmd: Command) => Command, recurse?: boolean) {
    const cur = this.collection.get(missionName)
    if (!cur) throw new MissingMission(missionName)
    this.changeManyParams(cur.map((_, i) => i), missionName, mod, recurse)
  }

  /**
   * Converts a mission into a mainline representation, which groups commands by their destination points.
   * Commands that are not destinations (like actions) are grouped with their preceding destination command.
   * @param mission - Optional mission name to convert. Defaults to "Main" mission.
   * @returns An array of MainLineItem objects, where each item contains:
   *          - cmd: The destination command (with lat/lng/alt)
   *          - id: The original index of the command in the flattened mission
   *          - other: Array of non-destination commands that should be executed at this location
   */
  mainLine(mission?: string) {
    const commands = this.flatten(mission ?? "Main")
    return convertToMainLine(commands)
  }
}

export type MainLine = MainLineItem[]
export type MainLineItem = { cmd: LatLngAltCommand, id: number, other: Command[] }

/**
 * Converts an array of commands into a mainline representation.
 * This groups non-destination commands (like actions) with their preceding destination command.
 * @param commands - Array of commands to convert
 * @returns An array of MainLineItem objects representing the mainline structure
 */
export function convertToMainLine(commands: Command[]) {
  const mainLine: MainLine = []

  commands.forEach((cmd, id) => {
    const desc = getCommandDesc(cmd.type)
    if (desc.isDestination && "latitude" in cmd.params && "longitude" in cmd.params && "altitude" in cmd.params) {
      mainLine.push({ cmd: cmd as LatLngAltCommand, id, other: [] })
    } else {
      if (mainLine.length !== 0) {
        mainLine[mainLine.length - 1].other.push(cmd)
      }
    }
  })
  return mainLine
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
