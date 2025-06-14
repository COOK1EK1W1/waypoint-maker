import { useWaypoints } from "@/util/context/WaypointContext";
import { bakeDubins, staticEvaluate } from "@/components/toolBar/bakeDubins";
import { pathEnergyRequirements, pathLength } from "@/lib/dubins/geometry";
import { geneticOptimise } from "@/lib/optimisation/genetic";
import { particleOptimise } from "@/lib/optimisation/particleSwarm";
import { useState } from "react";
import { useVehicle } from "@/util/context/VehicleTypeContext";
import { cn } from "@/lib/utils";
import { gradientOptimise } from "@/lib/optimisation/gradient";
import { splitDubinsRuns } from "@/lib/dubins/dubinWaypoints";
import { Path } from "@/lib/dubins/types";
import { XY } from "@/lib/math/types";
import { Plane } from "@/lib/vehicles/types";
import { Button } from "@/components/ui/button";


export function Optimise() {
  const { vehicle } = useVehicle()


  const { waypoints, setWaypoints, activeMission } = useWaypoints()
  const [optimiseRes, setOptimiseRes] = useState<{ s: number, e: number, t: number } | null>(null)

  // use before definition, but it works because JS :skull:
  const [algorithm, setAlgorithm] = useState<keyof typeof algorithms>("Particle")
  const [metric, setMetric] = useState<keyof typeof metrics>("Length")

  if (vehicle.type != "Plane") return <div>only planes are supported with optimisation</div>

  const metrics = { "Length": pathLength, "Energy": (x: Path<XY>) => pathEnergyRequirements(x, vehicle.cruiseAirspeed, vehicle.energyConstant) }
  const algorithms = { "Particle": particleOptimise, "Genetic": geneticOptimise, "Gradient": gradientOptimise }


  function runOptimisation() {
    let res = bakeDubins(waypoints, activeMission, algorithms[algorithm], setWaypoints, metrics[metric], vehicle as Plane)
    setOptimiseRes(res)
  }

  let energy = staticEvaluate(waypoints, activeMission, metrics["Energy"], vehicle as Plane)
  let length = staticEvaluate(waypoints, activeMission, metrics["Length"], vehicle as Plane)

  let dubinSections = splitDubinsRuns(waypoints.flatten(activeMission))
  if (dubinSections.length == 0) {
    return <div className="h-full w-full text-center content-center">Create some dubins waypoints to run optimisations</div>
  }

  return (
    <div className="flex">

      <div className="mx-2 flex flex-col">
        <h2>Algorithm</h2>
        <Button variant={algorithm == "Particle" ? "green" : "default"} onClick={() => setAlgorithm("Particle")}>Particle</Button>
        <Button variant={algorithm == "Genetic" ? "green" : "default"} onClick={() => setAlgorithm("Genetic")}>Genetic</Button>
        <Button variant={algorithm == "Gradient" ? "green" : "default"} onClick={() => setAlgorithm("Gradient")}>Gradient</Button>
      </div >
      <div className="mx-2 flex flex-col">
        <h2>Fitness</h2>
        <Button variant={metric == "Energy" ? "green" : "default"} onClick={() => setMetric("Energy")}>Energy</Button>
        <Button variant={metric == "Length" ? "green" : "default"} onClick={() => setMetric("Length")}>Length</Button>
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
