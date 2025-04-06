import { makeCommand } from "@/lib/commands/default";
import { MissingMission, RecursiveMission, WaypointCollection } from "@/lib/waypoints/waypointCollection";
import { CollectionType } from "@/types/waypoints";
import { expect, test } from "bun:test";

test("WaypointCollection default config", () => {
  const a = new WaypointCollection()
  expect(Array.from(a.getMissions()).length).toBe(3)
  expect(a.get("Main")).not.toBeUndefined()
  expect(a.get("Geofence")).not.toBeUndefined()
  expect(a.get("Markers")).not.toBeUndefined()
})

test("add_waypoint", () => {
  let a = new WaypointCollection()
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_LOITER_TURNS", {}) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_LOITER_TIME", {}) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_RETURN_TO_LAUNCH", {}) })

  const mission = a.get("Main")
  expect(mission).not.toBeUndefined()
  expect(mission?.length).toBe(3)
  expect(mission[0].cmd.type).toBe(18)
  expect(mission[1].cmd.type).toBe(19)
  expect(mission[2].cmd.type).toBe(20)
  expect(() => a.pushToMission("a", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", {}) })).toThrowError(MissingMission)
})


test("Contains, recursive", () => {
  let a = new WaypointCollection();
  // add waypoints to main
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })

  expect(a.contains("Main", "a")).toBeFalse()
  expect(a.isRecursive("Main")).toBeFalse()


  a.addSubMission("a")
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })

  expect(a.contains("Main", "a")).toBeFalse()
  expect(a.isRecursive("a")).toBeFalse()

  a.pushToMission("Main", { type: "Collection", name: "a", ColType: CollectionType.Mission, collectionID: "a", offsetLat: 0, offsetLng: 0 })

  expect(a.contains("Main", "a")).toBeTrue()

  expect(() => a.pushToMission("a", { type: "Collection", name: "Main", ColType: CollectionType.Mission, collectionID: "Main", offsetLat: 0, offsetLng: 0 })).toThrowError(RecursiveMission)

})

test("find Nth position", () => {
  let a = new WaypointCollection();
  // add waypoints to main
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })

  a.addSubMission("a")
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })

  a.pushToMission("Main", { type: "Collection", name: "a", ColType: CollectionType.Mission, collectionID: "a", offsetLat: 0, offsetLng: 0 })
  a.pushToMission("Main", { type: "Collection", name: "a", ColType: CollectionType.Mission, collectionID: "a", offsetLat: 0, offsetLng: 0 })

  const b = a.findNthPosition("Main", 0)
  expect(b).not.toBeUndefined()
  if (b) {
    expect(b[0]).toBe("Main")
    expect(b[1]).toBe(0)
  }

  const c = a.findNthPosition("Main", 3)
  expect(c).not.toBeUndefined()
  if (c) {
    expect(c[0]).toBe("a")
    expect(c[1]).toBe(0)
  }
  const d = a.findNthPosition("Main", 7)
  expect(d).not.toBeUndefined()
  if (d) {
    expect(d[0]).toBe("a")
    expect(d[1]).toBe(1)
  }

  const e = a.findNthPosition("Main", 11)
  expect(e).toBeUndefined()

})


test("pop", () => {
  let a = new WaypointCollection();
  // add waypoints to main
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 1 }) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 2 }) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 3 }) })

  expect(a.get("Main")?.length).toBe(3)
  const b = a.pop("Main")
  expect(b.cmd.params.altitude).toBe(3)
  expect(a.get("Main")?.length).toBe(2)
  const c = a.pop("Main")
  expect(c.cmd.params.altitude).toBe(2)
  expect(a.get("Main")?.length).toBe(1)
  const d = a.pop("Main")
  expect(d.cmd.params.altitude).toBe(1)
  expect(a.get("Main")?.length).toBe(0)
  const e = a.pop("Main")
  expect(e).toBeUndefined()
  expect(a.get("Main")?.length).toBe(0)

})


test("pop with index", () => {
  let a = new WaypointCollection();
  // add waypoints to main
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 1 }) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 2 }) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 3 }) })

  expect(a.get("Main")?.length).toBe(3)
  const b = a.pop("Main", 0)
  expect(b.cmd.params.altitude).toBe(1)
  expect(a.get("Main")?.length).toBe(2)
  const c = a.pop("Main", 0)
  expect(c.cmd.params.altitude).toBe(2)
  expect(a.get("Main")?.length).toBe(1)
  const d = a.pop("Main", 0)
  expect(d.cmd.params.altitude).toBe(3)
  expect(a.get("Main")?.length).toBe(0)
  const e = a.pop("Main", 0)
  expect(e).toBeUndefined()
  expect(a.get("Main")?.length).toBe(0)

})


test("clone", () => {
  let a = new WaypointCollection();
  // add waypoints to main
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })

  const b = a.clone()
  expect(b).not.toBe(a)
  expect(b.get("Main").length).toBe(3)
})


test("Flatten", () => {
  let a = new WaypointCollection();
  // add waypoints to main
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })

  a.addSubMission("a")
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })

  a.pushToMission("Main", { type: "Collection", name: "a", ColType: CollectionType.Mission, collectionID: "a", offsetLat: 0, offsetLng: 0 })
  const flattened = a.flatten("Main")
  expect(flattened.length).toBe(6)

})


test("insert", () => {
  let a = new WaypointCollection();
  // add waypoints to main
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 1 }) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 2 }) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 3 }) })

  a.addSubMission("a")
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 4 }) })
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 5 }) })
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 6 }) })

  a.pushToMission("Main", { type: "Collection", name: "a", ColType: CollectionType.Mission, collectionID: "a", offsetLat: 0, offsetLng: 0 })

  // insert at start
  a.insert(0, "Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 10 }) })

  expect(a.get("Main").length).toBe(5)
  expect(a.get("Main")[0].cmd.params.altitude).toBe(10)
  expect(a.get("Main")[1].cmd.params.altitude).toBe(1)

  // insert in middle
  a.insert(3, "Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 12 }) })

  expect(a.get("Main").length).toBe(6)
  expect(a.get("Main")[0].cmd.params.altitude).toBe(10)
  expect(a.get("Main")[3].cmd.params.altitude).toBe(12)

  // unexpected mission
  expect(() => a.insert(0, "bruh", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })).toThrowError(MissingMission)

  a.insert(0, "Main", { type: "Collection", name: "a", ColType: CollectionType.Mission, collectionID: "a", offsetLat: 0, offsetLng: 0 })
  a.insert(0, "Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  expect(a.get("Main")[0].type).toBe("Command")

  a.insert(10, "Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", {}) })
  expect(a.get("Main")[6].type).toBe("Command")
  // todo do recursion or linear
})

test("changeParam", () => {
  let a = new WaypointCollection();
  // add waypoints to main
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 0 }) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 1 }) })
  a.pushToMission("Main", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 2 }) })

  a.addSubMission("a")
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 4 }) })
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 5 }) })
  a.pushToMission("a", { type: "Command", cmd: makeCommand("WM_CMD_NAV_DUBINS", { altitude: 6 }) })

  a.pushToMission("Main", { type: "Collection", name: "a", ColType: CollectionType.Mission, collectionID: "a", offsetLat: 0, offsetLng: 0 })

  // insert at start
  a.changeParam(0, "Main", (x) => { x.params.altitude = 10; return x })

  expect(a.get("Main").length).toBe(4)
  expect(a.get("Main")[0].cmd.params.altitude).toBe(10)
  expect(a.get("Main")[1].cmd.params.altitude).toBe(1)

  // insert in middle
  a.changeParam(2, "Main", (x) => { x.params.altitude = 11; return x })

  expect(a.get("Main")[0].cmd.params.altitude).toBe(10)
  expect(a.get("Main")[2].cmd.params.altitude).toBe(11)

  // unexpected mission
  expect(() => a.changeParam(0, "bruh", (x) => x)).toThrowError(MissingMission)

  // todo do recursion or linear
})
