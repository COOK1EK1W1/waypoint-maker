import { MissingMission, WaypointCollection } from "@/lib/waypoints/waypointCollection";
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
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 0, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 1, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 2, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })

  const mission = a.get("Main")
  expect(mission).not.toBeUndefined()
  expect(mission?.length).toBe(3)
  expect(mission[0].wps.type).toBe(0)
  expect(mission[1].wps.type).toBe(1)
  expect(mission[2].wps.type).toBe(2)
  expect(() => a.pushToMission("a", { type: "Waypoint", wps: { frame: 0, type: 2, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })).toThrowError(MissingMission)
})


test("Contains, recursive", () => {
  let a = new WaypointCollection();
  // add waypoints to main
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })

  expect(a.contains("Main", "a")).toBeFalse()
  expect(a.isRecursive("Main")).toBeFalse()


  a.addSubMission("a")
  a.pushToMission("a", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("a", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("a", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })

  expect(a.contains("Main", "a")).toBeFalse()
  expect(a.isRecursive("a")).toBeFalse()

  a.pushToMission("Main", { type: "Collection", name: "a", ColType: CollectionType.Mission, collectionID: "a", offsetLat: 0, offsetLng: 0 })

  expect(a.contains("Main", "a")).toBeTrue()

  a.pushToMission("a", { type: "Collection", name: "Main", ColType: CollectionType.Mission, collectionID: "Main", offsetLat: 0, offsetLng: 0 })

  expect(a.get("a")?.length).toBe(4)
  expect(a.contains("Main", "Main")).toBeTrue()
  expect(a.isRecursive("Main")).toBeTrue()

})

test("find Nth position", () => {
  let a = new WaypointCollection();
  // add waypoints to main
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })

  a.addSubMission("a")
  a.pushToMission("a", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("a", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("a", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })

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

  const d = a.findNthPosition("Main", 10)
  expect(d).toBeUndefined()

})


test("pop", () => {
  let a = new WaypointCollection();
  // add waypoints to main
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 1, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 2, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })

  expect(a.get("Main")?.length).toBe(3)
  const b = a.pop("Main")
  expect(b.wps.frame).toBe(2)
  expect(a.get("Main")?.length).toBe(2)
  const c = a.pop("Main")
  expect(c.wps.frame).toBe(1)
  expect(a.get("Main")?.length).toBe(1)
  const d = a.pop("Main")
  expect(d.wps.frame).toBe(0)
  expect(a.get("Main")?.length).toBe(0)
  const e = a.pop("Main")
  expect(e).toBeUndefined()
  expect(a.get("Main")?.length).toBe(0)

})


test("pop with index", () => {
  let a = new WaypointCollection();
  // add waypoints to main
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 1, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 2, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })

  expect(a.get("Main")?.length).toBe(3)
  const b = a.pop("Main", 0)
  expect(b.wps.frame).toBe(0)
  expect(a.get("Main")?.length).toBe(2)
  const c = a.pop("Main", 0)
  expect(c.wps.frame).toBe(1)
  expect(a.get("Main")?.length).toBe(1)
  const d = a.pop("Main", 0)
  expect(d.wps.frame).toBe(2)
  expect(a.get("Main")?.length).toBe(0)
  const e = a.pop("Main", 0)
  expect(e).toBeUndefined()
  expect(a.get("Main")?.length).toBe(0)

})


test("clone", () => {
  let a = new WaypointCollection();
  // add waypoints to main
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 1, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 2, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })

  const b = a.clone()
  expect(b).not.toBe(a)
  expect(b.get("Main").length).toBe(3)
})


test("Flatten", () => {
  let a = new WaypointCollection();
  // add waypoints to main
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("Main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })

  a.addSubMission("a")
  a.pushToMission("a", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("a", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })
  a.pushToMission("a", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } })

  a.pushToMission("Main", { type: "Collection", name: "a", ColType: CollectionType.Mission, collectionID: "a", offsetLat: 0, offsetLng: 0 })
  const flattened = a.flatten("Main")
  expect(flattened.length).toBe(6)

})
