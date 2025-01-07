"use client"

import Button from "../toolBar/button";
import Modal from "./modal";
import { useWaypointContext } from "@/util/context/WaypointContext";
import { bakeDubins } from "../toolBar/bakeDubins";
import { pathEnergyRequirements, worldPathLength } from "@/lib/dubins/geometry";

export default function OptimiseModal({ open, handleClose }: { open: boolean, handleClose: () => void }) {
	const { waypoints, setWaypoints, activeMission } = useWaypointContext()

	if (open) {
		return (
			<Modal open={open} onClose={handleClose} className="w-full sm:w-[300px]" >

				<div>
					<h1>Optimise</h1>
					<h2>Algorithm</h2>
					<Button>Particle Swarm</Button>
					<h2>Fitness</h2>
					<Button>Energy</Button>
					<Button>Length</Button>

					<h2>Optimise</h2>
					<Button onClick={() => bakeDubins(waypoints, activeMission, setWaypoints, worldPathLength)}>Opimise Length</Button>
					<Button onClick={() => bakeDubins(waypoints, activeMission, setWaypoints, pathEnergyRequirements)}>Optimise Energy</Button>
				</div>
			</Modal>
		)
	}
}
