"use client"

import Button from "../toolBar/button";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { bakeDubins } from "../toolBar/bakeDubins";
import { pathEnergyRequirements, worldPathLength } from "@/lib/dubins/geometry";
import { geneticOptimise } from "@/lib/optimisation/genetic";
import { particleSwarmOptimisation } from "@/lib/optimisation/particleSwarm";

export default function OptimiseModal() {
	const { waypoints, setWaypoints, activeMission } = useWaypointContext()

	return (

		<div>
			<h2>Algorithm</h2>
			<Button>Particle Swarm</Button>
			<h2>Fitness</h2>
			<Button>Energy</Button>
			<Button>Length</Button>

			<h2>Optimise</h2>
			<Button onClick={() => bakeDubins(waypoints, activeMission, geneticOptimise, setWaypoints, worldPathLength)}>Opimise Length genetic</Button>
			<Button onClick={() => bakeDubins(waypoints, activeMission, geneticOptimise, setWaypoints, pathEnergyRequirements)}>Optimise Energy genetic</Button>
			<Button onClick={() => bakeDubins(waypoints, activeMission, particleSwarmOptimisation, setWaypoints, worldPathLength)}>Opimise Length particle</Button>
			<Button onClick={() => bakeDubins(waypoints, activeMission, particleSwarmOptimisation, setWaypoints, pathEnergyRequirements)}>Optimise Energy particle</Button>
		</div>
	)
}
