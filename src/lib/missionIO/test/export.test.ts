import { Mission } from "@/lib/waypoints/waypointCollection";
import { waypointTo_waypoints_file } from "@/lib/missionIO/waypointToFile";
import { expect, test } from "bun:test";
import { makeCommand } from "@/lib/commands/default";

test("waypoints to file", () => {

  //empty map
  const wps: Mission = new Mission()
  expect(waypointTo_waypoints_file(wps)).toBe("QGC WPL 110\n")

  // empty mission
  let wps2: Mission = new Mission()
  wps2.set("Main", [])
  expect(waypointTo_waypoints_file(wps2)).toBe("QGC WPL 110\n")

  // single waypoint
  let wps3: Mission = new Mission
  wps3.set("Main", [{ type: "Command", cmd: makeCommand("MAV_CMD_NAV_TAKEOFF", {}) }])
  expect(waypointTo_waypoints_file(wps3)).toBe("QGC WPL 110\n0\t1\t3\t22\t0\t0\t0\t0\t0\t0\t0\t1\n")

  // two waypoints
  let wps4: Mission = new Mission()
  wps4.set("Main", [{ type: "Command", cmd: makeCommand("MAV_CMD_NAV_TAKEOFF", {}) }, { type: "Command", cmd: makeCommand("MAV_CMD_NAV_TAKEOFF", {}) }])
  expect(waypointTo_waypoints_file(wps4)).toBe("QGC WPL 110\n0\t1\t3\t22\t0\t0\t0\t0\t0\t0\t0\t1\n1\t0\t3\t22\t0\t0\t0\t0\t0\t0\t0\t1\n")

  // param check
  let wps5: Mission = new Mission()
  wps5.set("Main", [{ type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { yaw: 10, altitude: 100, latitude: 52, longitude: -3, "pass radius": 30, "accept radius": 20, hold: 10 }) }, { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { yaw: 20, altitude: 50, latitude: -52, longitude: -30, "pass radius": 300, "accept radius": 200, hold: 100 }) }])
  expect(waypointTo_waypoints_file(wps5)).toBe("QGC WPL 110\n0\t1\t3\t16\t10\t20\t30\t10\t52\t-3\t100\t1\n1\t0\t3\t16\t100\t200\t300\t20\t-52\t-30\t50\t1\n")

  // sub mission
  let wps6: Mission = new Mission()
  wps6.set("Main", [{ type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { yaw: 10, altitude: 100, latitude: 52, longitude: -3, "pass radius": 30, "accept radius": 20, hold: 10 }) }, { type: "Collection", ColType: 0, collectionID: "Test", offsetLat: 0, offsetLng: 0, name: "Test" }])
  wps6.set("Test", [{ type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { yaw: 20, altitude: 50, latitude: -52, longitude: -30, "pass radius": 300, "accept radius": 200, hold: 100 }) }])
  expect(waypointTo_waypoints_file(wps5)).toBe("QGC WPL 110\n0\t1\t3\t16\t10\t20\t30\t10\t52\t-3\t100\t1\n1\t0\t3\t16\t100\t200\t300\t20\t-52\t-30\t50\t1\n")

})
