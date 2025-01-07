"use client"

import { downloadTextAsFile, waypointTo_waypoints_file } from "@/util/waypointToFile";
import Button from "../toolBar/button";
import { FaFileDownload } from "react-icons/fa";
import { useWaypointContext } from "@/util/context/WaypointContext";
import LoadJson from "../toolBar/load";

export default function MissionIOModal() {
	const { waypoints } = useWaypointContext()

	function downloadQGC() {
		const output = waypointTo_waypoints_file(waypoints)
		downloadTextAsFile("mission.waypoints", output)
	}


	function downloadWM() {
		const output = JSON.stringify(Array.from(waypoints), null, 2)
		downloadTextAsFile("mission.json", output)
	}

	return (
		<div>
			<h2>Export</h2>
			<Button onClick={downloadQGC}><FaFileDownload className="inline mx-2" />.waypoints (QGC, MP) download</Button>
			<Button onClick={downloadWM}><FaFileDownload className="inline mx-2" />.json (WM) download</Button>
			<h2>Import</h2>
			<LoadJson />
			<h2>Cloud Sync</h2>
			<div> (coming soon)</div>
		</div>
	)
}
