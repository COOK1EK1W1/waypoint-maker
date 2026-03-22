import { useWaypoints } from "@/util/context/WaypointContext";
import { bakeDubins, staticEvaluate } from "@/components/toolBar/bakeDubins";
import { geneticOptimise } from "@/lib/optimisation/genetic";
import { particleOptimise } from "@/lib/optimisation/particleSwarm";
import { useState } from "react";
import { useVehicle } from "@/util/context/VehicleTypeContext";
import { gradientOptimise } from "@/lib/optimisation/gradient";
import { splitDubinsRuns } from "@/lib/dubins/dubinWaypoints";
import { Curve, Path, Straight } from "@/lib/dubins/types";
import { XY } from "@/lib/math/types";
import { Plane } from "@/lib/vehicles/types";
import { Button } from "@/components/ui/button";


export function pathLength(path: (Straight<XY> | Curve<XY>)[]) {
  // The Path type can be found in src/lib/dubins/types.ts
  // It is an array of either straight or curve segments.
  // XY just means it's defined in 2d cartesian space (that means you can do 
  // usual geometry to figure out length)

  // Step 2.1 implementation goes here

  return 0
}

export function pathEnergy(path: Path<XY>) {
  // same interface as pathLength

  // Step 2.2 optional
  //
  // once completed, uncomment pathEnergy line below in the const metrics

  return 0
}

export function Optimise() {
  const { vehicle } = useVehicle()
  const { waypoints, setWaypoints, activeMission } = useWaypoints()
  const [optimiseRes, setOptimiseRes] = useState<{ s: number, e: number, t: number } | null>(null)
  const [algorithm, setAlgorithm] = useState<keyof typeof algorithms>("Particle")
  const [metric, setMetric] = useState<keyof typeof metrics>("Length")
  if (vehicle.type != "Plane") return <div>only planes are supported with optimisation</div>



  // This is where you can add additional fitness functions.
  // They will automatically render
  const metrics: Record<string, (path: Path<XY>) => number> = {
    "Length": pathLength,
    // "Energy": pathEnergy
  }

  let length = staticEvaluate(waypoints, activeMission, metrics["Length"], vehicle as Plane)
  //let energy = staticEvaluate(waypoints, activeMission, metrics["Energy"], vehicle as Plane)


  const algorithms = {
    "Particle": particleOptimise,
    "Genetic": geneticOptimise,
    "Gradient": gradientOptimise
  }

  function runOptimisation() {
    let res = bakeDubins(waypoints, activeMission, algorithms[algorithm], setWaypoints, metrics[metric], vehicle as Plane)
    setOptimiseRes(res)
  }

  let energy = 0

  let dubinSections = splitDubinsRuns(waypoints.mainLine(activeMission))
  if (dubinSections.length == 0) {
    return <div className="h-full w-full text-center content-center">Create some dubins waypoints to run optimisations</div>
  }

  return (
    <div className="flex">

      <div className="mx-2 flex flex-col">
        <h2>Algorithm</h2>
        {
          Object.keys(algorithms).map((x, i) => (
            <Button key={i} variant={algorithm == x ? "green" : "default"} onClick={() => setAlgorithm(x as keyof typeof algorithms)}>{x}</Button>
          ))
        }
      </div >
      <div className="mx-2 flex flex-col">
        <h2>Fitness</h2>
        {
          Object.keys(metrics).map((x, i) => (
            <Button key={i} variant={metric == x ? "green" : "default"} onClick={() => setMetric(x as keyof typeof metrics)}>{x}</Button>
          ))
        }
      </div>

      <div className="w-40 mx-2">
        <h2>Optimise</h2>
        <Button onClick={() => runOptimisation()}>Optimise</Button>
        {optimiseRes ? <div>
          <p>Starting: <span className="text-red-500">{optimiseRes.s.toFixed(1)}</span></p>
          <p>Ending: <span className="text-green-500">{optimiseRes.e.toFixed(1)}</span></p>
          <p>Reduced: <span className="text-green-500">{(100 - optimiseRes.e / optimiseRes.s * 100).toFixed(1)}%</span></p>
          <p>Time: {optimiseRes.t}ms</p>
        </div> : null
        }
      </div>
      <div className="w-40">
        <h2>Current</h2>
        <p>Length: {length.toFixed(1)}m</p>
        <p>Time: {(length / vehicle.cruiseAirspeed).toFixed(1)}s</p>
        <p>Energy: {(energy / 1000).toFixed(1)}wh</p>
      </div>

    </div >
  )

}
