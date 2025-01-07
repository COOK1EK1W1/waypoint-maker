"use client"

import { downloadTextAsFile, waypointTo_waypoints_file } from "@/util/waypointToFile";
import Button from "../toolBar/button";
import Modal from "./modal";
import { FaFileDownload } from "react-icons/fa";
import { useWaypointContext } from "@/util/context/WaypointContext";
import LoadJson from "../toolBar/load";

export default function MissionIOModal({ open, handleClose }: { open: boolean, handleClose: () => void }) {
	const { waypoints } = useWaypointContext()

	function downloadQGC() {
		const output = waypointTo_waypoints_file(waypoints)
		downloadTextAsFile("mission.waypoints", output)
	}


	function downloadWM() {
		const output = JSON.stringify(Array.from(waypoints), null, 2)
		downloadTextAsFile("mission.json", output)
	}

	if (open) {
		return (
			<Modal open={open} onClose={handleClose} className="w-full sm:w-[300px]" >

				<div>
					<h1>Export</h1>
					<Button onClick={downloadQGC}><FaFileDownload className="inline mx-2" />.waypoints (QGC, MP) download</Button>
					<Button onClick={downloadWM}><FaFileDownload className="inline mx-2" />.json (WM) download</Button>
					<h1>Import</h1>
					<LoadJson />
					<h1>Cloud Sync</h1>
					<div> (coming soon)</div>
				</div>
			</Modal>
		)
	}
}
