import { WaypointCollection } from "@/types/waypoints";
import { waypointTo_waypoints_file } from "@/util/waypointToFile";
import { expect, test } from "bun:test";

test("waypoints to file", () => {

  //empty map
  const wps: WaypointCollection = new Map()
  expect(waypointTo_waypoints_file(wps)).toBe("QGC WPL 110\n")

  // empty mission
  let wps2: WaypointCollection = new Map()
  wps2.set("Main", [])
  expect(waypointTo_waypoints_file(wps2)).toBe("QGC WPL 110\n")

  // single waypoint
  let wps3: WaypointCollection = new Map()
  wps3.set("Main", [{ type: "Waypoint", wps: { frame: 0, type: 0, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } }])
  expect(waypointTo_waypoints_file(wps3)).toBe("QGC WPL 110\n0\t1\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\n")

  // two waypoints
  let wps4: WaypointCollection = new Map()
  wps4.set("Main", [{ type: "Waypoint", wps: { frame: 0, type: 0, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } }, { type: "Waypoint", wps: { frame: 0, type: 0, param1: 0, param2: 0, param3: 0, param4: 0, param5: 0, param6: 0, param7: 0, autocontinue: 0 } }])
  expect(waypointTo_waypoints_file(wps4)).toBe("QGC WPL 110\n0\t1\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\n1\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\t0\n")

  // param check
  let wps5: WaypointCollection = new Map()
  wps5.set("Main", [{ type: "Waypoint", wps: { frame: 1, type: 2, param1: 3, param2: 4, param3: 5, param4: 6, param5: 7, param6: 8, param7: 9, autocontinue: 10 } }, { type: "Waypoint", wps: { frame: 10, type: 11, param1: 12, param2: 13, param3: 14, param4: 15, param5: 16, param6: 17, param7: 18, autocontinue: 19 } }])
  expect(waypointTo_waypoints_file(wps5)).toBe("QGC WPL 110\n0\t1\t1\t2\t3\t4\t5\t6\t7\t8\t9\t10\n1\t0\t10\t11\t12\t13\t14\t15\t16\t17\t18\t19\n")

  // sub mission
  let wps6: WaypointCollection = new Map()
  wps6.set("Main", [{ type: "Waypoint", wps: { frame: 1, type: 2, param1: 3, param2: 4, param3: 5, param4: 6, param5: 7, param6: 8, param7: 9, autocontinue: 10 } }, { type: "Collection", ColType: 0, collectionID: "Test", offsetLat: 0, offsetLng: 0, name: "Test" }])
  wps6.set("Test", [{ type: "Waypoint", wps: { frame: 10, type: 11, param1: 12, param2: 13, param3: 14, param4: 15, param5: 16, param6: 17, param7: 18, autocontinue: 19 } }])
  expect(waypointTo_waypoints_file(wps6)).toBe("QGC WPL 110\n0\t1\t1\t2\t3\t4\t5\t6\t7\t8\t9\t10\n1\t0\t10\t11\t12\t13\t14\t15\t16\t17\t18\t19\n")

})
