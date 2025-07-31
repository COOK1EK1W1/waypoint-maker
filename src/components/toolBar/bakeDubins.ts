import { applyBounds, dubinsBetweenDubins, getBounds, getTunableDubinsParameters, setTunableDubinsParameter, setTunableParameter, splitDubinsRuns, waypointToDubins } from "@/lib/dubins/dubinWaypoints";
import { bound, dubinsPoint, Path } from "@/lib/dubins/types";
import { XY } from "@/lib/math/types";
import { Mission } from "@/lib/mission/mission";
import { res } from "@/lib/optimisation/types";
import { Plane } from "@/lib/vehicles/types";
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
    const flatPath = path.flatMap((x) => [x.turnA, x.straight, x.turnB])
    return optimisationFunction(flatPath)
  }
  return evaluate
}

export function staticEvaluate(waypoints: Mission, activeMission: string, optimisationFunction: (path: Path<XY>) => number, vehicle: Plane) {
  let activeWaypoints = waypoints.mainLine(activeMission)

  const reference = waypoints.getReferencePoint()

  let dubinSections = splitDubinsRuns(activeWaypoints)
  let fitness = 0

  // optimise each section of the path
  for (const section of dubinSections) {

    let dubinsPoints: dubinsPoint[] = section.run.map((x) => waypointToDubins(x.cmd, reference))

    let startingParams = [...getTunableDubinsParameters(dubinsPoints)]
    let bounds: bound[] = [...getBounds(dubinsPoints, vehicle)]
    applyBounds(startingParams, bounds)

    let evaluate = createEvaluate(dubinsPoints, optimisationFunction)
    fitness += evaluate(startingParams)
  }
  return fitness

}

export function bakeDubins(waypoints: Mission, activeMission: string, optimisationmethod: (initialGuess: readonly number[], bounds: bound[], fn: (a: number[]) => number) => res, setWaypoints: Dispatch<SetStateAction<Mission>>, optimisationFunction: (path: Path<XY>) => number, vehicle: Plane) {
  let mainLine = waypoints.mainLine(activeMission)

  const startTime = performance.now()

  // get reference waypoint
  const reference = waypoints.getReferencePoint()

  let dubinSections = splitDubinsRuns(mainLine)
  let endingFitness = 0
  let startingFitness = 0

  let curWaypoints = waypoints.clone()

  // optimise each section of the path
  for (const section of dubinSections) {

    let dubinsPoints: dubinsPoint[] = section.run.map((x) => waypointToDubins(x.cmd, reference))

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

    setTunableParameter(section.run, result.finalVals)
    // Apply the updated command parameters back onto the cloned waypoint tree.
    // The `mainLine` representation stores the original flattened index in
    // `item.id`, so we can use that directly to locate the corresponding
    // command inside `curWaypoints`.

    for (const item of section.run) {
      // Only Dubins (type 69) commands have tunable parameters we modified.
      if (item.cmd.type !== 69) continue;

      const position = curWaypoints.findNthPosition(activeMission, item.id);
      if (!position) continue;

      const [missionName, idx] = position;
      const missionNodes = curWaypoints.get(missionName);

      const targetNode = missionNodes[idx];
      if (targetNode && targetNode.type === "Command") {
        // Safety check – ensure we are overwriting the same command type.
        console.assert(item.cmd.type === targetNode.cmd.type, "Waypoint type mismatch");
        // Replace the command with the optimised one.
        targetNode.cmd = { ...item.cmd };
      }
    }
  }
  setWaypoints(curWaypoints)
  const endTime = performance.now()
  return { s: startingFitness, e: endingFitness, t: endTime - startTime }
}
