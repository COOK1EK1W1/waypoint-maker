import { applyBounds, dubinsBetweenWaypoint, getBounds, getTunableParameters, setTunableParameter, splitDubinsRuns } from "@/lib/dubins/dubinWaypoints";
import { res } from "@/lib/optimisation/types";
import { WaypointCollection } from "@/lib/waypoints/waypointCollection";
import { bound, Path } from "@/types/dubins";
import { Waypoint } from "@/types/waypoints";
import { Dispatch, SetStateAction } from "react";

export function bakeDubins(waypoints: WaypointCollection, activeMission: string, optimisationmethod: (initialGuess: readonly number[], bounds: bound[], fn: (a: number[]) => number) => res, setWaypoints: Dispatch<SetStateAction<WaypointCollection>>, optimisationFunction: (path: Path) => number) {
  let activeWaypoints: Waypoint[] = waypoints.flatten(activeMission)

  const startTime = performance.now()

  // get reference waypoint
  const reference = waypoints.getReferencePoint()

  let dubinSections = splitDubinsRuns(activeWaypoints)
  let endingFitness = 0
  let startingFitness = 0

  // This function is a closure that takes in the waypoints and returns a function that takes in the tunable parameters and returns the total length of the path
  function create_evaluate(wps: Waypoint[]) {
    let localWPS: Waypoint[] = []
    for (let x = 0; x < wps.length; x++) {
      localWPS.push({ ...wps[x] })
    }
    function evaluate(x: number[]): number {
      setTunableParameter(localWPS, x)
      let totalLength = 0
      for (let i = 0; i < wps.length - 1; i++) {
        let curves = dubinsBetweenWaypoint(localWPS[i], localWPS[i + 1], reference)
        totalLength += optimisationFunction(curves)
      }
      return totalLength

    }
    return evaluate
  }

  let curWaypoints = waypoints.clone()

  // optimise each section of the path
  for (const section of dubinSections) {
    let starting_params = [...getTunableParameters(section.wps)]
    let bounds: bound[] = [...getBounds(section.wps)]
    applyBounds(starting_params, bounds)

    let b = create_evaluate(section.wps)
    startingFitness += b(starting_params)

    let result = optimisationmethod(starting_params, bounds, b) // 2041
    applyBounds(result.finalVals, bounds)
    endingFitness += b(result.finalVals)
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
