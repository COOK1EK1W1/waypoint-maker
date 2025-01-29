import { applyBounds, dubinsBetweenWaypoint, getBounds, getTunableParameters, setTunableParameter, splitDubinsRuns } from "@/lib/dubins/dubinWaypoints";
import { geneticOptimise } from "@/lib/optimisation/genetic";
import { particleSwarmOptimisation } from "@/lib/optimisation/particleSwarm";
import { WaypointCollection } from "@/lib/waypoints/waypointCollection";
import { bound, Path } from "@/types/dubins";
import { Waypoint } from "@/types/waypoints";
import { Dispatch, SetStateAction } from "react";

export function bakeDubins(waypoints: WaypointCollection, activeMission: string, setWaypoints: Dispatch<SetStateAction<WaypointCollection>>, optimisationFunction: (path: Path) => number) {
  let activeWaypoints: Waypoint[] = waypoints.flatten(activeMission)

  // get reference waypoint
  let main = waypoints.get("Main")
  if (!main || main.length == 0) return
  let reference = main[0]
  if (reference.type != "Waypoint") return
  const referenceWP = reference.wps

  let dubinSections = splitDubinsRuns(activeWaypoints)

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
        let curves = dubinsBetweenWaypoint(localWPS[i], localWPS[i + 1], referenceWP)
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

    let optimised_dirs = particleSwarmOptimisation(starting_params, bounds, b, 200) // 2041
    //let optimised_dirs = geneticOptimise(starting_params, bounds, b, 200) // 
    applyBounds(optimised_dirs, bounds)

    setTunableParameter(section.wps, optimised_dirs)
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
}
