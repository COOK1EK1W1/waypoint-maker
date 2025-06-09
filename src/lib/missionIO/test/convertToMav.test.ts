import { expect, test } from "bun:test";
import { convertToMAV } from "../common";
import { makeCommand } from "@/lib/commands/default";
import { Command, LatLngCommand, MavCommand } from "@/lib/commands/commands";

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
  const mission: LatLngCommand[] = [
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.7, longitude: -3.3 }),
    makeCommand("WM_CMD_NAV_DUBINS", { latitude: 55.8, longitude: -3.3, heading: 45, radius: 100 }),
    makeCommand("WM_CMD_NAV_DUBINS", { latitude: 55.8, longitude: -3.2, heading: 135, radius: 100 }),
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.7, longitude: -3.2 }),
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.6, longitude: -3.2 }),
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
  expect(mavMission[6].param5).toBeCloseTo(mission[4].params.latitude)
  expect(mavMission[6].param6).toBeCloseTo(mission[4].params.longitude)
  expect(mavMission[7]).toBeUndefined()
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

test("Dubins point with Set Servo", () => {
  const mission: Command[] = [
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.7, longitude: -3.3, altitude: 100 }),
    makeCommand("WM_CMD_NAV_DUBINS", { latitude: 55.8, longitude: -3.3, altitude: 100, radius: 100, heading: 40 }),
    makeCommand("MAV_CMD_DO_SET_SERVO", { pwm: 1500 }),
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.8, longitude: -3.2, altitude: 100 }),
  ]
  const mavMission = convertToMAV(mission, { lat: 55.75, lng: -3.25 })

  //start
  expect(mavMission[0].type).toBe(16)

  // approach
  expect(mavMission[1].type).toBe(16)

  // first curve
  expect(mavMission[2].type).toBe(18)

  // center of arc
  expect(mavMission[3].type).toBe(183)

  // second arc
  expect(mavMission[4].type).toBe(18)

  // end
  expect(mavMission[5].type).toBe(16)
  expect(mavMission[6]).toBeUndefined()
})

test("Dubins point with multiple Set Servo", () => {
  const mission: Command[] = [
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.7, longitude: -3.3, altitude: 100 }),
    makeCommand("MAV_CMD_DO_SET_SERVO", { pwm: 1500 }),
    makeCommand("WM_CMD_NAV_DUBINS", { latitude: 55.8, longitude: -3.3, altitude: 100, radius: 100, heading: 40 }),
    makeCommand("MAV_CMD_DO_SET_SERVO", { pwm: 1500 }),
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.8, longitude: -3.2, altitude: 100 }),
    makeCommand("MAV_CMD_DO_SET_SERVO", { pwm: 1500 }),
  ]
  const mavMission = convertToMAV(mission, { lat: 55.75, lng: -3.25 })

  //start
  expect(mavMission[0].type).toBe(16)
  expect(mavMission[1].type).toBe(183)

  // approach
  expect(mavMission[2].type).toBe(16)

  // first curve
  expect(mavMission[3].type).toBe(18)

  // center of arc
  expect(mavMission[4].type).toBe(183)

  // second arc
  expect(mavMission[5].type).toBe(18)

  // end
  expect(mavMission[6].type).toBe(16)
  expect(mavMission[7].type).toBe(183)
  expect(mavMission[8]).toBeUndefined()
})

test("Dubins adjust height", () => {
  const mission: Command[] = [
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: -0.1, longitude: 0, altitude: 100 }),
    makeCommand("WM_CMD_NAV_DUBINS", { latitude: 0, longitude: 0, altitude: 100, radius: 100, heading: 0 }),
    makeCommand("WM_CMD_NAV_DUBINS", { latitude: 0.1, longitude: 0, altitude: 90, radius: 100, heading: 0 }),
  ]
  const mavMission = convertToMAV(mission, { lat: 0, lng: 0 })

  expect(mavMission[0].type).toBe(16)
  expect(mavMission[0].param7).toBe(100)
  expect(mavMission[1].type).toBe(16)
  expect(mavMission[1].param7).toBe(100)
  expect(mavMission[2].type).toBe(16)
  expect(mavMission[2].param7).toBe(90)

  expect(mavMission[3]).toBeUndefined()
})


test("split Dubins point alt test", () => {
  const mission: LatLngCommand[] = [
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.7, longitude: -3.3, altitude: 100 }),
    makeCommand("WM_CMD_NAV_DUBINS", { latitude: 55.8, longitude: -3.3, heading: 70, radius: 100, altitude: 80 }),
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.7, longitude: -3.25, altitude: 60 }),
    makeCommand("WM_CMD_NAV_DUBINS", { latitude: 55.8, longitude: -3.3, heading: 99, radius: 100, altitude: 80 }),
    makeCommand("MAV_CMD_NAV_WAYPOINT", { latitude: 55.7, longitude: -3.2, altitude: 100 })
  ]
  const mavMission = convertToMAV(mission, { lat: 55.75, lng: -3.25 })
  // entry
  expect(mavMission[0].type).toBe(16)
  expect(mavMission[0].param7).toBe(100)

  // wp into first turn
  expect(mavMission[1].type).toBe(16)
  expect(mavMission[1].param7).toBeLessThan(100)
  expect(mavMission[1].param7).toBeGreaterThan(80)

  // first turn
  expect(mavMission[2].type).toBe(18)
  expect(mavMission[2].param7).toBe(80)

  // hit apex same turn
  expect(mavMission[3].type).toBe(18)
  expect(mavMission[3].param7).toBeLessThan(80)
  expect(mavMission[3].param7).toBeGreaterThan(60)

  // this is the wp from mission
  expect(mavMission[4].type).toBe(16)
  expect(mavMission[4].param7).toBe(60)

  // entry wp into second turn
  expect(mavMission[5].type).toBe(16)
  expect(mavMission[5].param7).toBeLessThan(80)
  expect(mavMission[5].param7).toBeGreaterThan(60)

  // second turn
  expect(mavMission[6].type).toBe(18)
  expect(mavMission[6].param7).toBe(80)

  // after apex rise again
  expect(mavMission[7].type).toBe(18)
  expect(mavMission[7].param7).toBeLessThan(100)
  expect(mavMission[7].param7).toBeGreaterThan(80)

  // final wp
  expect(mavMission[8].type).toBe(16)
  expect(mavMission[8].param7).toBe(100)
  expect(mavMission[9]).toBeUndefined()
})
