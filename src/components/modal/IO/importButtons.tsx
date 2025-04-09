"use client"
import { useWaypoints } from '@/util/context/WaypointContext';
import React from 'react';
import Button from '@/components/toolBar/button';
import { FaFileUpload } from 'react-icons/fa';
import { useMap } from '@/util/context/MapContext';
import { avgLatLng } from '@/lib/world/distance';
import { filterLatLngCmds } from '@/lib/commands/commands';
import { getLatLng } from '@/util/WPCollection';
import { parseMissionString } from '@/lib/missionIO/common';
import { useVehicle } from '@/util/context/VehicleTypeContext';

export default function LoadJson() {
  const { setWaypoints } = useWaypoints();
  const { setVehicle } = useVehicle();
  const { moveMap } = useMap();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return
    }

    const file = event.target.files[0];

    if (!file) {
      console.error("please select a file first")
      return;
    }

    const reader = new FileReader();
    reader.readAsText(file)

    reader.onload = () => {
      try {
        if (reader.result == null) return
        let parsed = parseMissionString("" + reader.result)
        if (parsed === undefined) {
          throw new Error("bruh")
        }
        const mission = parsed.mission
        let main = mission.get("Main")
        if (main) {
          if (moveMap.move) {
            const avgll = avgLatLng(filterLatLngCmds(mission.flatten("Main")).map(getLatLng))
            if (avgll !== undefined) {
              moveMap.move(avgll.lat, avgll.lng)
            }
          }
          setWaypoints(mission)
          setVehicle(parsed.vehicle)
        }
      } catch (err) {
        console.error(err)
      }
    };

  };

  return <>
    <input type="file" accept=".json, .waypoints" id="fileInput" className="hidden" onChange={handleFileChange} />
    <Button onClick={() => document.getElementById('fileInput')?.click()}>
      <FaFileUpload className="inline" />Load JSON
    </Button>
  </>
}
