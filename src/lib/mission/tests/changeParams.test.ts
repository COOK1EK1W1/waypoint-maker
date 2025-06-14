import { Mission, CollectionType, MissingMission, WPNode } from "../mission";
import { makeCommand } from "@/lib/commands/default";
import { expect, test, describe } from "bun:test";

describe("Mission Parameter Changes", () => {
  test("changeParam basic functionality", () => {
    let mission = new Mission();
    // add waypoints to main
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 0 }) })
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 1 }) })
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 2 }) })

    // Test changing first waypoint
    mission.changeParam(0, "Main", (x) => { (x.params as any).altitude = 10; return x })
    const firstNode = mission.get("Main")[0] as WPNode
    const secondNode = mission.get("Main")[1] as WPNode
    expect((firstNode.cmd.params as any).altitude).toBe(10)
    expect((secondNode.cmd.params as any).altitude).toBe(1)

    // Test changing middle waypoint
    mission.changeParam(1, "Main", (x) => { (x.params as any).altitude = 11; return x })
    const thirdNode = mission.get("Main")[2] as WPNode
    expect((firstNode.cmd.params as any).altitude).toBe(10)
    expect((secondNode.cmd.params as any).altitude).toBe(11)
    expect((thirdNode.cmd.params as any).altitude).toBe(2)

    // Test error handling
    expect(() => mission.changeParam(0, "nonexistent", (x) => x)).toThrowError(MissingMission)
  })

  test("changeParam with collections and recursion", () => {
    let mission = new Mission();
    
    // Create main mission with commands and a collection
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 0 }) })
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 1 }) })
    
    // Create sub-mission
    mission.addSubMission("SubMission")
    mission.pushToMission("SubMission", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 2 }) })
    mission.pushToMission("SubMission", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 3 }) })
    
    // Add collection to main mission
    mission.pushToMission("Main", { 
      type: "Collection", 
      name: "SubMission", 
      ColType: CollectionType.Mission, 
      collectionID: "SubMission", 
      offsetLat: 0, 
      offsetLng: 0 
    })

    // Test changing command in main mission
    mission.changeParam(0, "Main", (x) => { (x.params as any).altitude = 10; return x })
    const mainNode = mission.get("Main")[0] as WPNode
    expect((mainNode.cmd.params as any).altitude).toBe(10)

    // Test changing command in collection with recursion
    mission.changeParam(2, "Main", (x) => { (x.params as any).altitude = 20; return x }, true)
    const subNode1 = mission.get("SubMission")[0] as WPNode
    const subNode2 = mission.get("SubMission")[1] as WPNode
    expect((subNode1.cmd.params as any).altitude).toBe(20)
    expect((subNode2.cmd.params as any).altitude).toBe(20)
  })

  test("changeManyParams functionality", () => {
    let mission = new Mission();
    
    // Create mission with multiple commands
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 0 }) })
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 1 }) })
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 2 }) })
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 3 }) })

    // Test changing multiple specific commands
    mission.changeManyParams([0, 2], "Main", (x) => { (x.params as any).altitude = 10; return x })
    const nodes = mission.get("Main").map(node => node as WPNode)
    expect((nodes[0].cmd.params as any).altitude).toBe(10)
    expect((nodes[1].cmd.params as any).altitude).toBe(1)
    expect((nodes[2].cmd.params as any).altitude).toBe(10)
    expect((nodes[3].cmd.params as any).altitude).toBe(3)

    // Test error handling
    expect(() => mission.changeManyParams([0], "nonexistent", (x) => x)).toThrowError(MissingMission)
  })

  test("changeAllParams functionality", () => {
    let mission = new Mission();
    
    // Create mission with multiple commands
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 0 }) })
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 1 }) })
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 2 }) })

    // Test changing all commands
    mission.changeAllParams("Main", (x) => { (x.params as any).altitude = 10; return x })
    const nodes = mission.get("Main").map(node => node as WPNode)
    expect((nodes[0].cmd.params as any).altitude).toBe(10)
    expect((nodes[1].cmd.params as any).altitude).toBe(10)
    expect((nodes[2].cmd.params as any).altitude).toBe(10)

    // Test error handling
    expect(() => mission.changeAllParams("nonexistent", (x) => x)).toThrowError(MissingMission)
  })

  test("changeAllParams with recursion", () => {
    let mission = new Mission();
    
    // Create main mission
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 0 }) })
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 1 }) })
    
    // Create sub-mission
    mission.addSubMission("SubMission")
    mission.pushToMission("SubMission", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 2 }) })
    mission.pushToMission("SubMission", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 3 }) })
    
    // Add collection to main mission
    mission.pushToMission("Main", { 
      type: "Collection", 
      name: "SubMission", 
      ColType: CollectionType.Mission, 
      collectionID: "SubMission", 
      offsetLat: 0, 
      offsetLng: 0 
    })

    // Test changing all commands with recursion
    mission.changeAllParams("Main", (x) => { (x.params as any).altitude = 10; return x }, true)
    
    // Check main mission
    const mainNodes = mission.get("Main").map(node => node as WPNode)
    expect((mainNodes[0].cmd.params as any).altitude).toBe(10)
    expect((mainNodes[1].cmd.params as any).altitude).toBe(10)
    
    // Check sub-mission
    const subNodes = mission.get("SubMission").map(node => node as WPNode)
    expect((subNodes[0].cmd.params as any).altitude).toBe(10)
    expect((subNodes[1].cmd.params as any).altitude).toBe(10)
  })

  test("changeParam with sub-mission at start", () => {
    let mission = new Mission();
    
    // Create sub-mission with commands
    mission.addSubMission("SubMission")
    mission.pushToMission("SubMission", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 0 }) })
    mission.pushToMission("SubMission", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 1 }) })
    
    // Add sub-mission at the start of main mission
    mission.pushToMission("Main", { 
      type: "Collection", 
      name: "SubMission", 
      ColType: CollectionType.Mission, 
      collectionID: "SubMission", 
      offsetLat: 0, 
      offsetLng: 0 
    })
    
    // Add commands after the sub-mission
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 2 }) })
    mission.pushToMission("Main", { type: "Command", cmd: makeCommand("MAV_CMD_NAV_WAYPOINT", { altitude: 3 }) })
    
    // Try to change the first command after the sub-mission
    // This should target the command with altitude 2
    mission.changeParam(1, "Main", (x) => { (x.params as any).altitude = 10; return x })
    
    // Verify the changes
    const mainNodes = mission.get("Main").map(node => node as WPNode)
    const subNodes = mission.get("SubMission").map(node => node as WPNode)
    
    // Check that sub-mission commands weren't changed
    expect((subNodes[0].cmd.params as any).altitude).toBe(0)
    expect((subNodes[1].cmd.params as any).altitude).toBe(1)
    
    // Check that the correct command after the sub-mission was changed
    expect((mainNodes[1].cmd.params as any).altitude).toBe(10)
    expect((mainNodes[2].cmd.params as any).altitude).toBe(3)
  })
}) 