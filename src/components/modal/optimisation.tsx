"use client"

import Button from "../toolBar/button";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { bakeDubins } from "../toolBar/bakeDubins";
import { pathEnergyRequirements, worldPathLength } from "@/lib/dubins/geometry";

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
			<Button onClick={() => bakeDubins(waypoints, activeMission, setWaypoints, worldPathLength)}>Opimise Length</Button>
			<Button onClick={() => bakeDubins(waypoints, activeMission, setWaypoints, pathEnergyRequirements)}>Optimise Energy</Button>
		</div>
	)
}
