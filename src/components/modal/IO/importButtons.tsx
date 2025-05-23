"use client"
import { useWaypoints } from '@/util/context/WaypointContext';
import React from 'react';
import Button from '@/components/toolBar/button';
import { useMap } from '@/util/context/MapContext';
import { filterLatLngCmds } from '@/lib/commands/commands';
import { parseMissionString } from '@/lib/missionIO/common';
import { useVehicle } from '@/util/context/VehicleTypeContext';
import { avgLatLng, getLatLng } from '@/lib/world/latlng';
import { Upload } from 'lucide-react';

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
        if (parsed.data === null) {
          throw new Error("bruh")
        }
        const mission = parsed.data.mission
        let main = mission.get("Main")
        if (main) {
          if (moveMap.move) {
            const avgll = avgLatLng(filterLatLngCmds(mission.flatten("Main")).map(getLatLng))
            if (avgll !== undefined) {
              moveMap.move(avgll.lat, avgll.lng)
            }
          }
          setWaypoints(mission)
          setVehicle(parsed.data.vehicle)
        }
      } catch (err) {
        console.error(err)
      }
    };

  };

  return <>
    <input type="file" accept=".json, .waypoints" id="fileInput" className="hidden" onChange={handleFileChange} />
    <Button className="w-32 items-center justify-start" onClick={() => document.getElementById('fileInput')?.click()}>
      <Upload className="h-[20px] w-[20px] mr-1" />Load JSON
    </Button>
  </>
}
