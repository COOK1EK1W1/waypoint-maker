import { expect, test } from "bun:test";
import { makeCommand } from "../default";
import { coerceCommand } from "../convert";

test("coerce waypoint 2 waypoint", () => {
  const command = makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 100, longitude: -3.3, latitude: 52, hold: 10, yaw: 20, "pass radius": 50 })
  const newDubins = coerceCommand(command, "MAV_CMD_NAV_WAYPOINT")

  expect(newDubins.type).toBe(16)
  expect(newDubins.params.altitude).toBe(100)
  expect(newDubins.params.longitude).toBe(-3.3)
  expect(newDubins.params.latitude).toBe(52)
  expect(newDubins.params.hold).toBe(10)
  expect(newDubins.params.yaw).toBe(20)
  expect(newDubins.params["pass radius"]).toBe(50)
})

test("coerce waypoint 2 dubins", () => {
  const command = makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 100, longitude: -3.3, latitude: 52 })
  const newDubins = coerceCommand(command, "WM_CMD_NAV_DUBINS")

  expect(newDubins.type).toBe(69)
  expect(newDubins.params.altitude).toBe(100)
  expect(newDubins.params.longitude).toBe(-3.3)
  expect(newDubins.params.latitude).toBe(52)
  expect(newDubins.params.radius).toBe(0)

})
