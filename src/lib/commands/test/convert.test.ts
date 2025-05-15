import { expect, test } from "bun:test";
import { makeCommand } from "../default";
import { coerceCommand, WPM2MAV } from "../convert";

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

test("WPM2MAV converts waypoint command correctly", () => {
  const command = makeCommand("MAV_CMD_NAV_WAYPOINT", { 
    altitude: 100, 
    longitude: -3.3, 
    latitude: 52, 
    hold: 10, 
    yaw: 20, 
    "pass radius": 50,
    "accept radius": 30 
  })
  const mavCommands = WPM2MAV([command])
  
  expect(mavCommands).toHaveLength(1)
  const mavCmd = mavCommands[0]
  
  expect(mavCmd.type).toBe(16) // MAV_CMD_NAV_WAYPOINT
  expect(mavCmd.frame).toBe(3)
  expect(mavCmd.autocontinue).toBe(1)
  expect(mavCmd.param1).toBe(10) // hold
  expect(mavCmd.param2).toBe(30) // accept radius
  expect(mavCmd.param3).toBe(50) // pass radius
  expect(mavCmd.param4).toBe(20) // yaw
  expect(mavCmd.param5).toBe(52) // latitude
  expect(mavCmd.param6).toBe(-3.3) // longitude
  expect(mavCmd.param7).toBe(100) // altitude
})

test("WPM2MAV converts multiple commands", () => {
  const waypoint = makeCommand("MAV_CMD_NAV_WAYPOINT", { 
    altitude: 100, 
    longitude: -3.3, 
    latitude: 52 
  })
  const land = makeCommand("MAV_CMD_NAV_LAND", { 
    altitude: 0, 
    longitude: -3.4, 
    latitude: 52.1,
    "abort alt": 50
  })
  
  const mavCommands = WPM2MAV([waypoint, land])
  
  expect(mavCommands).toHaveLength(2)
  
  // Check waypoint command
  expect(mavCommands[0].type).toBe(16)
  expect(mavCommands[0].param5).toBe(52)
  expect(mavCommands[0].param6).toBe(-3.3)
  expect(mavCommands[0].param7).toBe(100)
  
  // Check land command
  expect(mavCommands[1].type).toBe(21)
  expect(mavCommands[1].param1).toBe(50) // abort alt
  expect(mavCommands[1].param5).toBe(52.1)
  expect(mavCommands[1].param6).toBe(-3.4)
  expect(mavCommands[1].param7).toBe(0)
})

test("WPM2MAV handles commands with missing parameters", () => {
  const command = makeCommand("MAV_CMD_NAV_WAYPOINT", { 
    altitude: 100, 
    longitude: -3.3 
    // latitude is missing
  })
  const mavCommands = WPM2MAV([command])
  
  expect(mavCommands).toHaveLength(1)
  const mavCmd = mavCommands[0]
  
  expect(mavCmd.type).toBe(16)
  expect(mavCmd.param5).toBe(0) // latitude should be 0 when missing
  expect(mavCmd.param6).toBe(-3.3)
  expect(mavCmd.param7).toBe(100)
})
