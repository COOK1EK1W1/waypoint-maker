import { expect, test } from "bun:test";
import { convertToMAV } from "../common";
import { makeCommand } from "@/lib/commands/default";
import { Command, LatLngCommand } from "@/lib/commands/commands";
import { MavCommand } from "@/lib/commands/types";

test("empty", () => {
  const mission: Command[] = []
  const mavMission = convertToMAV(mission, { lat: 0, lng: 0 })
  expect(mavMission.length).toBe(0)
})

test("three points", () => {
  const mission: Command[] = [
    makeCommand("MAV_CMD_NAV_WAYPOINT", { longitude: -3, latitude: 55, altitude: 100 }),
    makeCommand("MAV_CMD_NAV_WAYPOINT", { longitude: -3, latitude: 55, altitude: 100 }),
    makeCommand("MAV_CMD_NAV_WAYPOINT", { longitude: -3, latitude: 55, altitude: 100 })
  ]
  const mission2: MavCommand[] = [
    {
      frame: 3,
      type: 16,
      param1: 0, param2: 0, param3: 0, param4: 0, param5: 55, param6: -3, param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 16,
      param1: 0, param2: 0, param3: 0, param4: 0, param5: 55, param6: -3, param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 16,
      param1: 0, param2: 0, param3: 0, param4: 0, param5: 55, param6: -3, param7: 100,
      autocontinue: 1
    }]
  const mavMission = convertToMAV(mission, { lat: 55.75, lng: -3.25 })
  expect(mavMission).toEqual(mission2)
})

test("single Dubins point", () => {
  const mission: Command[] = [
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.7, longitude: -3.3, altitude: 100 }),
    makeCommand("WM_CMD_NAV_DUBINS", { latitude: 55.8, longitude: -3.3, altitude: 100, radius: 100, heading: 40 }),
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.8, longitude: -3.2, altitude: 100 }),
  ]
  const mavMission = convertToMAV(mission, { lat: 55.75, lng: -3.25 })
  expect(mavMission[0].type).toBe(16)
  expect(mavMission[0].param5).toEqual(55.7)
  expect(mavMission[0].param6).toEqual(-3.3)


  expect(mavMission[1].type).toBe(16)

  expect(mavMission[2].type).toBe(18)
  expect(mavMission[2].param3).toBe(100) // radius
  expect(mavMission[2].param4).toBe(1) // exit tang
  expect(mavMission[2].param1).toBeGreaterThan(0) // turns
  expect(mavMission[2].param1).toBeLessThan(1) // turns

  expect(mavMission[3].type).toBe(16)
  expect(mavMission[3].param6).toEqual(-3.2)
  expect(mavMission[3].param5).toEqual(55.8)
  expect(mavMission[4]).toBeUndefined()
})


test("single Dubins point reverse", () => {
  const mission: Command[] = [
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.8, longitude: -3.2 }),
    makeCommand("WM_CMD_NAV_DUBINS", { latitude: 55.8, longitude: -3.3, radius: 100, heading: 230 }),
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.7, longitude: -3.3 })
  ]

  const mavMission = convertToMAV(mission, { lat: 55.75, lng: -3.25 })
  expect(mavMission[0].type).toBe(16)
  expect(mavMission[0].param5).toEqual(55.8)
  expect(mavMission[0].param6).toEqual(-3.2)


  expect(mavMission[1].type).toBe(16)

  expect(mavMission[2].type).toBe(18)

  expect(mavMission[3].type).toBe(16)
  expect(mavMission[3].param5).toEqual(55.7)
  expect(mavMission[3].param6).toEqual(-3.3)
  expect(mavMission[4]).toBeUndefined()
})



test("double Dubins point", () => {
  const mission: Command[] = [
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.7, longitude: -3.3 }),
    makeCommand("WM_CMD_NAV_DUBINS", { latitude: 55.8, longitude: -3.3, heading: 45, radius: 100 }),
    makeCommand("WM_CMD_NAV_DUBINS", { latitude: 55.8, longitude: -3.2, heading: 135, radius: 100 }),
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.7, longitude: -3.2 }),
  ]
  const mavMission = convertToMAV(mission, { lat: 55.75, lng: -3.25 })
  expect(mavMission[0].type).toBe(16)
  expect(mavMission[0].param5).toEqual(55.7)
  expect(mavMission[0].param6).toEqual(-3.3)


  expect(mavMission[1].type).toBe(16)

  expect(mavMission[2].type).toBe(18)

  expect(mavMission[3].type).toBe(16)

  expect(mavMission[4].type).toBe(18)

  expect(mavMission[5].type).toBe(16)
  expect(mavMission[5].param5).toBeCloseTo(mission[3].params.latitude)
  expect(mavMission[5].param6).toBeCloseTo(mission[3].params.longitude)
  expect(mavMission[6]).toBeUndefined()
})

test("split Dubins point", () => {
  const mission: LatLngCommand[] = [
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.7, longitude: -3.3 }),
    makeCommand("WM_CMD_NAV_DUBINS", { latitude: 55.8, longitude: -3.3, heading: 70, radius: 100 }),
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.7, longitude: -3.25 }),
    makeCommand("WM_CMD_NAV_DUBINS", { latitude: 55.8, longitude: -3.3, heading: 99, radius: 100 }),
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.7, longitude: -3.2 })
  ]
  const mavMission = convertToMAV(mission, { lat: 55.75, lng: -3.25 })
  expect(mavMission[0].type).toBe(16)
  expect(mavMission[0].param5).toBeCloseTo(mission[0].params.latitude)
  expect(mavMission[0].param6).toBeCloseTo(mission[0].params.longitude)

  expect(mavMission[1].type).toBe(16)

  expect(mavMission[2].type).toBe(18)
  expect(mavMission[2].param3).toBe(100) // radius
  expect(mavMission[2].param4).toBe(1) // exit tang
  expect(mavMission[2].param1).toBeGreaterThan(0) // turns
  expect(mavMission[2].param1).toBeLessThan(1) // turns

  expect(mavMission[3].type).toBe(16)
  expect(mavMission[3].param5).toBeCloseTo(mission[2].params.latitude)
  expect(mavMission[3].param6).toBeCloseTo(mission[2].params.longitude)

  expect(mavMission[4].type).toBe(16)

  expect(mavMission[5].type).toBe(18)
  expect(mavMission[5].param3).toBe(100) // radius
  expect(mavMission[5].param4).toBe(1) // exit tang
  expect(mavMission[5].param1).toBeGreaterThan(0) // turns
  expect(mavMission[5].param1).toBeLessThan(1) // turns

  expect(mavMission[6].type).toBe(16)
  expect(mavMission[6].param5).toBeCloseTo(mission[4].params.latitude)
  expect(mavMission[6].param6).toBeCloseTo(mission[4].params.longitude)
  expect(mavMission[7]).toBeUndefined()
})
