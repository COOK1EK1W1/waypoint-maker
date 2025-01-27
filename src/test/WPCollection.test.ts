import { CollectionType, WaypointCollection3 } from "@/types/waypoints";
import { add_waypoint, contains, isRecursive } from "@/util/WPCollection";
import { expect, test } from "bun:test";

test("add_waypoint", () => {
  let a: WaypointCollection3 = new Map();
  a.set("main", [])
  a = add_waypoint("main", { type: "Waypoint", wps: { frame: 0, type: 0, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } }, a)
  a = add_waypoint("main", { type: "Waypoint", wps: { frame: 0, type: 1, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } }, a)
  a = add_waypoint("main", { type: "Waypoint", wps: { frame: 0, type: 2, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } }, a)

  const mission = a.get("main")
  expect(mission).not.toBeUndefined()
  expect(mission?.length).toBe(3)
  expect(mission[0].wps.type).toBe(0)
  expect(mission[1].wps.type).toBe(1)
  expect(mission[2].wps.type).toBe(2)
  expect(() => add_waypoint("a", { type: "Waypoint", wps: { frame: 0, type: 2, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } }, a)).toThrowError()


})
test("Contains", () => {
  let a: WaypointCollection3 = new Map();
  // add waypoints to main
  a.set("main", [])
  a = add_waypoint("main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } }, a)
  a = add_waypoint("main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } }, a)
  a = add_waypoint("main", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } }, a)

  expect(contains("main", "a", a)).toBeFalse()
  expect(isRecursive("main", a)).toBeFalse()


  a.set("a", [])
  a = add_waypoint("a", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } }, a)
  a = add_waypoint("a", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } }, a)
  a = add_waypoint("a", { type: "Waypoint", wps: { frame: 0, type: 69, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } }, a)

  expect(contains("main", "a", a)).toBeFalse()
  expect(isRecursive("a", a)).toBeFalse()

  a = add_waypoint("main", { type: "Collection", name: "a", ColType: CollectionType.Mission, collectionID: "a", offsetLat: 0, offsetLng: 0 }, a)

  expect(contains("main", "a", a)).toBeTrue()

  a = add_waypoint("a", { type: "Collection", name: "main", ColType: CollectionType.Mission, collectionID: "main", offsetLat: 0, offsetLng: 0 }, a)

  expect(a.get("a")?.length).toBe(4)
  expect(contains("main", "main", a)).toBeTrue()
  expect(isRecursive("main", a)).toBeTrue()

})
