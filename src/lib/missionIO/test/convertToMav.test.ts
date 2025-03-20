import { expect, test } from "bun:test";
import { convertToMAV } from "../common";
import { Waypoint } from "@/types/waypoints";

test("empty", () => {
  const mission: Waypoint[] = []
  const mavMission = convertToMAV(mission, { lat: 0, lng: 0 })
  expect(mavMission.length).toBe(0)
})

test("three points", () => {
  const mission: Waypoint[] = [
    {
      frame: 3,
      type: 16,
      param1: 0,
      param2: 0,
      param3: 0,
      param4: 0,
      param5: 55.712829137890554,
      param6: -3.3306598663330083,
      param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 16,
      param1: 0,
      param2: 0,
      param3: 0,
      param4: 0,
      param5: 55.812829137890554,
      param6: -3.3306598663330083,
      param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 16,
      param1: 0,
      param2: 0,
      param3: 0,
      param4: 0,
      param5: 55.912829137890554,
      param6: -3.2306598663330083,
      param7: 100,
      autocontinue: 1
    }
  ]
  const mavMission = convertToMAV(mission, { lat: 55.75, lng: -3.25 })
  expect(mavMission).toEqual(mission)
})

test("single Dubins point", () => {
  const mission: Waypoint[] = [
    {
      frame: 3,
      type: 16,
      param1: 0,
      param2: 0,
      param3: 0,
      param4: 0,
      param5: 55.71282913789,
      param6: -3.330659866333,
      param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 69,
      param1: 0,
      param2: 40,
      param3: 100,
      param4: 0,
      param5: 55.81282913789,
      param6: -3.330659866333,
      param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 16,
      param1: 0,
      param2: 0,
      param3: 0,
      param4: 0,
      param5: 55.81282913789,
      param6: -3.230659866333,
      param7: 100,
      autocontinue: 1
    }
  ]
  const mavMission = convertToMAV(mission, { lat: 55.75, lng: -3.25 })
  expect(mavMission[0].type).toBe(16)
  expect(mavMission[0]).toEqual(mission[0])


  expect(mavMission[1].type).toBe(16)

  expect(mavMission[2].type).toBe(18)

  expect(mavMission[3].type).toBe(16)
  expect(mavMission[3]).toEqual(mission[2])
  expect(mavMission[4]).toBeUndefined()
})


test("single Dubins point reverse", () => {
  const mission: Waypoint[] = [
    {
      frame: 3,
      type: 16,
      param1: 0,
      param2: 0,
      param3: 0,
      param4: 0,
      param5: 55.81282913789,
      param6: -3.230659866333,
      param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 69,
      param1: 0,
      param2: 40,
      param3: 230,
      param4: 0,
      param5: 55.81282913789,
      param6: -3.330659866333,
      param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 16,
      param1: 0,
      param2: 0,
      param3: 0,
      param4: 0,
      param5: 55.71282913789,
      param6: -3.330659866333,
      param7: 100,
      autocontinue: 1
    }
  ]
  const mavMission = convertToMAV(mission, { lat: 55.75, lng: -3.25 })
  expect(mavMission[0].type).toBe(16)
  expect(mavMission[0]).toEqual(mission[0])


  expect(mavMission[1].type).toBe(16)

  expect(mavMission[2].type).toBe(18)

  expect(mavMission[3].type).toBe(16)
  expect(mavMission[3]).toEqual(mission[2])
  expect(mavMission[4]).toBeUndefined()
})



test("double Dubins point", () => {
  const mission: Waypoint[] = [
    {
      frame: 3,
      type: 16,
      param1: 0,
      param2: 0,
      param3: 0,
      param4: 0,
      param5: 55.71282913789,
      param6: -3.330659866333,
      param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 69,
      param1: 0,
      param2: 45,
      param3: 100,
      param4: 0,
      param5: 55.81282913789,
      param6: -3.330659866333,
      param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 69,
      param1: 0,
      param2: 135,
      param3: 100,
      param4: 0,
      param5: 55.81282913789,
      param6: -3.230659866333,
      param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 16,
      param1: 0,
      param2: 0,
      param3: 0,
      param4: 0,
      param5: 55.71282913789,
      param6: -3.230659866333,
      param7: 100,
      autocontinue: 1
    }
  ]
  const mavMission = convertToMAV(mission, { lat: 55.75, lng: -3.25 })
  console.log(mavMission)
  expect(mavMission[0].type).toBe(16)
  expect(mavMission[0]).toEqual(mission[0])


  expect(mavMission[1].type).toBe(16)

  expect(mavMission[2].type).toBe(18)

  expect(mavMission[3].type).toBe(16)

  expect(mavMission[4].type).toBe(18)

  expect(mavMission[5].type).toBe(16)
  expect(mavMission[5].param5).toBeCloseTo(mission[3].param5)
  expect(mavMission[5].param6).toBeCloseTo(mission[3].param6)
  expect(mavMission[6]).toBeUndefined()
})

test("split Dubins point", () => {
  const mission: Waypoint[] = [
    {
      frame: 3,
      type: 16,
      param1: 0,
      param2: 0,
      param3: 0,
      param4: 0,
      param5: 55.71282913789,
      param6: -3.330659866333,
      param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 69,
      param1: 0,
      param2: 70,
      param3: 100,
      param4: 0,
      param5: 55.81282913789,
      param6: -3.330659866333,
      param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 16,
      param1: 0,
      param2: 0,
      param3: 0,
      param4: 0,
      param5: 55.71282913789,
      param6: -3.280659866333,
      param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 69,
      param1: 0,
      param2: 99,
      param3: 100,
      param4: 0,
      param5: 55.81282913789,
      param6: -3.230659866333,
      param7: 100,
      autocontinue: 1
    }, {
      frame: 3,
      type: 16,
      param1: 0,
      param2: 0,
      param3: 0,
      param4: 0,
      param5: 55.71282913789,
      param6: -3.230659866333,
      param7: 100,
      autocontinue: 1
    }
  ]
  const mavMission = convertToMAV(mission, { lat: 55.75, lng: -3.25 })
  expect(mavMission[0].type).toBe(16)
  expect(mavMission[0].param5).toBeCloseTo(mission[0].param5)
  expect(mavMission[0].param6).toBeCloseTo(mission[0].param6)

  expect(mavMission[1].type).toBe(16)

  expect(mavMission[2].type).toBe(18)

  expect(mavMission[3].type).toBe(16)
  expect(mavMission[3].param5).toBeCloseTo(mission[2].param5)
  expect(mavMission[3].param6).toBeCloseTo(mission[2].param6)

  expect(mavMission[4].type).toBe(16)

  expect(mavMission[5].type).toBe(18)

  expect(mavMission[6].type).toBe(16)
  expect(mavMission[6].param5).toBeCloseTo(mission[4].param5)
  expect(mavMission[6].param6).toBeCloseTo(mission[4].param6)
  expect(mavMission[7]).toBeUndefined()
})
