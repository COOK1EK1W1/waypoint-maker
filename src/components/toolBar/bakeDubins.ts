import { dubinsBetweenWaypoint, getTunableParameters, setTunableParameter, splitDubinsRuns } from "@/lib/dubins/dubinWaypoints";
import { worldPathLength } from "@/lib/dubins/geometry";
import { particleSwarmOptimise } from "@/lib/optimisation/particleSwarm";
import { bound, Path } from "@/types/dubins";
import { Waypoint, WaypointCollection } from "@/types/waypoints";
import { changeParam, findnthwaypoint, get_waypoints } from "@/util/WPCollection";
import { Dispatch, SetStateAction } from "react";

export function bakeDubins(waypoints: WaypointCollection, activeMission: string, setWaypoints: Dispatch<SetStateAction<WaypointCollection>>, optimisationFunction: (path: Path)=>number){
  let activeWaypoints: Waypoint[] = get_waypoints(activeMission, waypoints)

  let dubinSections = splitDubinsRuns(activeWaypoints)

  function create_evaluate(wps: Waypoint[]){
    let localWPS = [...wps]
    function evaluate(x: number[]): number{
      localWPS = setTunableParameter(localWPS, x)
      let totalLength = 0
      for (let i = 0; i < wps.length - 1; i++){
        let curves = dubinsBetweenWaypoint(localWPS[i], localWPS[i+1])
        totalLength += optimisationFunction(curves)
      }
      return totalLength

    }
    return evaluate
  }
  let curWaypoints = new Map(waypoints)
  for (const section of dubinSections){
    let starting_params = [...getTunableParameters(section.wps)]
    let bounds: bound[] = []
    for (let i = 0; i < starting_params.length; i++){
      if (i % 2 == 0){
        bounds.push({min: 0, max: 6.28})
      }else{
        bounds.push({min: 50})
      }
    }
    let b = create_evaluate(section.wps)

    let optimised_dirs = particleSwarmOptimise(starting_params, bounds, b, 200)

    for (let i = section.start; i < section.start + section.wps.length; i++){
      let a = findnthwaypoint(activeMission, i, curWaypoints)
      if (!a) continue;
      curWaypoints = changeParam(a[1], a[0], curWaypoints, (x)=>{
        if (x.type != 69) return x
        let cur = optimised_dirs.shift()
        if (cur){
          x.param2 = cur
        }
        cur = optimised_dirs.shift()
        if (cur){
          x.param3 = cur
        }
        return x

      })
    }
  }
  setWaypoints(curWaypoints)
}
