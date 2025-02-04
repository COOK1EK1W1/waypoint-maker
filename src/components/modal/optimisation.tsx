"use client"

import Button from "../toolBar/button";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { bakeDubins } from "../toolBar/bakeDubins";
import { pathEnergyRequirements, pathLength } from "@/lib/dubins/geometry";
import { geneticOptimise } from "@/lib/optimisation/genetic";
import { particleOptimise } from "@/lib/optimisation/particleSwarm";
import { useState } from "react";

const algorithms = { "Particle": particleOptimise, "Genetic": geneticOptimise }
const metrics = { "Length": pathLength, "Energy": pathEnergyRequirements }

export default function OptimiseModal() {
	const { waypoints, setWaypoints, activeMission } = useWaypointContext()
	const [optimiseRes, setOptimiseRes] = useState<{ s: number, e: number, t: number } | null>(null)
	const [algorithm, setAlgorithm] = useState<keyof typeof algorithms>("Particle")
	const [metric, setMetric] = useState<keyof typeof metrics>("Length")

	function runOptimisation() {
		let res = bakeDubins(waypoints, activeMission, algorithms[algorithm], setWaypoints, metrics[metric])
		setOptimiseRes(res)
	}

	return (

		<div>
			<h2>Algorithm</h2>
			<Button className={algorithm == "Particle" ? "border-green-300 bg-green-200" : ""} onClick={() => setAlgorithm("Particle")}>Particle Swarm</Button>
			<Button className={algorithm == "Genetic" ? "border-green-300 bg-green-200" : ""} onClick={() => setAlgorithm("Genetic")}>Genetic</Button>
			<h2>Fitness</h2>
			<Button className={metric == "Energy" ? "border-green-300 bg-green-200" : ""} onClick={() => setMetric("Energy")}>Energy</Button>
			<Button className={metric == "Length" ? "border-green-300 bg-green-200" : ""} onClick={() => setMetric("Length")}>Length</Button>

			<h2>Optimise</h2>
			<Button onClick={() => runOptimisation()}>Optimise</Button>
			{optimiseRes ? <div>
				<p>starting: <span className="text-red-600">{optimiseRes.s.toFixed(1)}</span></p>
				<p>ending: <span className="text-green-600">{optimiseRes.e.toFixed(1)}</span></p>
				<p>reduced: <span className="text-green-600">{(optimiseRes.e / optimiseRes.s * 100).toFixed(1)}%</span></p>
				<p>time: {optimiseRes.t}ms</p>

			</div> : null}
		</div>
	)
}
