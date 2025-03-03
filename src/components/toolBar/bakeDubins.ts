import { applyBounds, dubinsBetweenDubins, getBounds, getTunableDubinsParameters, setTunableDubinsParameter, setTunableParameter, splitDubinsRuns, waypointToDubins } from "@/lib/dubins/dubinWaypoints";
import { bound, dubinsPoint, Path } from "@/lib/dubins/types";
import { XY } from "@/lib/math/types";
import { res } from "@/lib/optimisation/types";
import { WaypointCollection } from "@/lib/waypoints/waypointCollection";
import { Plane } from "@/types/vehicleType";
import { Waypoint } from "@/types/waypoints";
import { Dispatch, SetStateAction } from "react";

// This function is a closure that takes in the waypoints and returns a function that takes in the tunable parameters and returns the total length of the path
export function createEvaluate(wps: dubinsPoint[], optimisationFunction: (path: Path<XY>) => number) {
  // copy the dubins points
  let localWPS: dubinsPoint[] = []
  for (let x = 0; x < wps.length; x++) {
    localWPS.push({ ...wps[x] })
  }

  function evaluate(x: number[]): number {
    setTunableDubinsParameter(localWPS, x)
    let path = dubinsBetweenDubins(localWPS)
    return optimisationFunction(path)
  }
  return evaluate
}

export function staticEvaluate(waypoints: WaypointCollection, activeMission: string, optimisationFunction: (path: Path<XY>) => number, vehicle: Plane) {
  let activeWaypoints: Waypoint[] = waypoints.flatten(activeMission)

  const reference = waypoints.getReferencePoint()

  let dubinSections = splitDubinsRuns(activeWaypoints)
  let fitness = 0

  // optimise each section of the path
  for (const section of dubinSections) {

    let dubinsPoints: dubinsPoint[] = section.wps.map((x) => waypointToDubins(x, reference))

    let startingParams = [...getTunableDubinsParameters(dubinsPoints)]
    let bounds: bound[] = [...getBounds(dubinsPoints, vehicle)]
    applyBounds(startingParams, bounds)

    let evaluate = createEvaluate(dubinsPoints, optimisationFunction)
    fitness += evaluate(startingParams)
  }
  return fitness

}

export function bakeDubins(waypoints: WaypointCollection, activeMission: string, optimisationmethod: (initialGuess: readonly number[], bounds: bound[], fn: (a: number[]) => number) => res, setWaypoints: Dispatch<SetStateAction<WaypointCollection>>, optimisationFunction: (path: Path<XY>) => number, vehicle: Plane) {
  let activeWaypoints: Waypoint[] = waypoints.flatten(activeMission)

  const startTime = performance.now()

  // get reference waypoint
  const reference = waypoints.getReferencePoint()

  let dubinSections = splitDubinsRuns(activeWaypoints)
  let endingFitness = 0
  let startingFitness = 0

  let curWaypoints = waypoints.clone()

  // optimise each section of the path
  for (const section of dubinSections) {

    let dubinsPoints: dubinsPoint[] = section.wps.map((x) => waypointToDubins(x, reference))

    let startingParams = [...getTunableDubinsParameters(dubinsPoints)]
    let bounds: bound[] = [...getBounds(dubinsPoints, vehicle)]
    applyBounds(startingParams, bounds)

    let evaluate = createEvaluate(dubinsPoints, optimisationFunction)
    startingFitness += evaluate(startingParams)
    console.log(startingFitness)

    let result = optimisationmethod(startingParams, bounds, evaluate) // 2041
    console.log(result)
    applyBounds(result.finalVals, bounds)
    endingFitness += evaluate(result.finalVals)
    console.log("fitness: ", result.fitness, "  took: ", result.time)

    setTunableParameter(section.wps, result.finalVals)
    let wps = section.wps

    if (wps[0].type != 69) {
      wps.shift()
    }

    for (let i = 0; i < wps.length; i++) {
      let a = curWaypoints.findNthPosition(activeMission, i + section.start)
      if (!a) continue;
      let mission = waypoints.get(a[0])
      if (!mission) continue;
      let curWP = mission[a[1]]
      if (!curWP) continue;
      if (curWP.type == "Waypoint") {
        console.assert(wps[i].type == curWP.wps.type, "Waypoint type mismatch")
        curWP.wps = wps[i]
      }
    }
  }
  setWaypoints(curWaypoints)
  const endTime = performance.now()
  return { s: startingFitness, e: endingFitness, t: endTime - startTime }
}
