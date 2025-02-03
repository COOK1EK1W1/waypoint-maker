"use client"

import Button from "../toolBar/button";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { bakeDubins } from "../toolBar/bakeDubins";
import { pathEnergyRequirements, worldPathLength } from "@/lib/dubins/geometry";
import { geneticOptimise } from "@/lib/optimisation/genetic";
import { particleSwarmOptimisation } from "@/lib/optimisation/particleSwarm";
import { optimisationAlgorithm } from "@/lib/optimisation/types";
import { Path } from "@/types/dubins";
import { useState } from "react";

export default function OptimiseModal() {
	const { waypoints, setWaypoints, activeMission } = useWaypointContext()
	const [optimiseRes, setOptimiseRes] = useState<{ s: number, e: number, t: number } | null>(null)

	function runOptimisation(alg: optimisationAlgorithm, fn: (path: Path) => number) {
		let res = bakeDubins(waypoints, activeMission, alg, setWaypoints, fn)
		console.log(res)
		setOptimiseRes(res)
	}

	return (

		<div>
			<h2>Algorithm</h2>
			<Button>Particle Swarm</Button>
			<h2>Fitness</h2>
			<Button>Energy</Button>
			<Button>Length</Button>

			<h2>Optimise</h2>
			<Button onClick={() => runOptimisation(geneticOptimise, pathEnergyRequirements)}>Opimise Length genetic</Button>
			<Button onClick={() => runOptimisation(geneticOptimise, pathEnergyRequirements)}>Optimise Energy genetic</Button>
			<Button onClick={() => runOptimisation(particleSwarmOptimisation, worldPathLength)}>Opimise Length particle</Button>
			<Button onClick={() => runOptimisation(particleSwarmOptimisation, pathEnergyRequirements)}>Optimise Energy particle</Button>
			{optimiseRes ? <div>
				<p>starting: {optimiseRes.s.toFixed(1)}</p>
				<p>ending: <span className="text-green-600">{optimiseRes.e.toFixed(1)}</span></p>
				<p>reduced: <span className="text-green-600">{(optimiseRes.e / optimiseRes.s * 100).toFixed(1)}%</span></p>
				<p>time: {optimiseRes.t}ms</p>

			</div> : null}
		</div>
	)
}
