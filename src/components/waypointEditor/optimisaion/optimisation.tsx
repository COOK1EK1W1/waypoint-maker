

import { useWaypointContext } from "@/util/context/WaypointContext";
import { bakeDubins, staticEvaluate } from "@/components/toolBar/bakeDubins";
import { pathEnergyRequirements, pathLength } from "@/lib/dubins/geometry";
import { geneticOptimise } from "@/lib/optimisation/genetic";
import { particleOptimise } from "@/lib/optimisation/particleSwarm";
import { useState } from "react";
import Button from "@/components/toolBar/button";
import { useVehicleTypeContext } from "@/util/context/VehicleTypeContext";
import { Path, XY } from "@/types/dubins";
import { Plane } from "@/types/vehicleType";
import { cn } from "@/lib/utils";
import { binaryGradient } from "@/lib/optimisation/binaryGradient";


export function Optimise() {
  const { vehicle } = useVehicleTypeContext()
  if (vehicle.type != "Plane") return <div>only planes are supported with optimisation</div>

  const algorithms = { "Particle": particleOptimise, "Genetic": geneticOptimise, "Binary": binaryGradient }
  const metrics = { "Length": pathLength, "Energy": (x: Path<XY>) => pathEnergyRequirements(x, vehicle.cruiseAirspeed, vehicle.energyConstant) }

  const { waypoints, setWaypoints, activeMission } = useWaypointContext()
  const [optimiseRes, setOptimiseRes] = useState<{ s: number, e: number, t: number } | null>(null)
  const [algorithm, setAlgorithm] = useState<keyof typeof algorithms>("Particle")
  const [metric, setMetric] = useState<keyof typeof metrics>("Length")


  function runOptimisation() {
    let res = bakeDubins(waypoints, activeMission, algorithms[algorithm], setWaypoints, metrics[metric], vehicle as Plane)
    setOptimiseRes(res)
  }

  let energy = staticEvaluate(waypoints, activeMission, metrics["Energy"], vehicle as Plane)
  let length = staticEvaluate(waypoints, activeMission, metrics["Length"], vehicle as Plane)

  return (
    <div className="flex">

      <div>
        <h2>Algorithm</h2>
        <Button className={cn("w-28", algorithm == "Particle" ? "border-green-300 bg-green-200" : "")} onClick={() => setAlgorithm("Particle")}>Particle</Button>
        <Button className={cn("w-28", algorithm == "Genetic" ? "border-green-300 bg-green-200" : "")} onClick={() => setAlgorithm("Genetic")}>Genetic</Button>
        <Button className={cn("w-28", algorithm == "Binary" ? "border-green-300 bg-green-200" : "")} onClick={() => setAlgorithm("Binary")}>Binary</Button>
      </div>
      <div>
        <h2>Fitness</h2>
        <Button className={cn("w-28", metric == "Energy" ? "border-green-300 bg-green-200" : "")} onClick={() => setMetric("Energy")}>Energy</Button>
        <Button className={cn("w-28", metric == "Length" ? "border-green-300 bg-green-200" : "")} onClick={() => setMetric("Length")}>Length</Button>
      </div>

      <div>
        <h2>Optimise</h2>
        <Button className="w-28" onClick={() => runOptimisation()}>Optimise</Button>
        {optimiseRes ? <div>
          <p>starting: <span className="text-red-600">{optimiseRes.s.toFixed(1)}</span></p>
          <p>ending: <span className="text-green-600">{optimiseRes.e.toFixed(1)}</span></p>
          <p>reduced: <span className="text-green-600">{(optimiseRes.e / optimiseRes.s * 100).toFixed(1)}%</span></p>
          <p>time: {optimiseRes.t}ms</p>
        </div> : null
        }
      </div>
      <div>
        <h2>current</h2>
        <p>length: {length}</p>
        <p>energy: {energy}</p>
      </div>

    </div>
  )

}
