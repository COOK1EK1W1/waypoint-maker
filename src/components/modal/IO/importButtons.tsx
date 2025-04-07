"use client"
import { useWaypoints } from '@/util/context/WaypointContext';
import React from 'react';
import Button from '@/components/toolBar/button';
import { FaFileUpload } from 'react-icons/fa';
import { WaypointCollection } from '@/lib/waypoints/waypointCollection';
import { useMap } from '@/util/context/MapContext';
import { avgLatLng } from '@/lib/world/distance';
import { filterLatLngCmds } from '@/lib/commands/commands';
import { getLatLng } from '@/util/WPCollection';

export default function LoadJson() {
  const { setWaypoints } = useWaypoints();
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
        const parsedData = JSON.parse("" + reader.result);
        let wps = new WaypointCollection(new Map(parsedData))
        let main = wps.get("Main")
        if (main) {
          if (moveMap.move) {
            const avgll = avgLatLng(filterLatLngCmds(wps.flatten("Main")).map(getLatLng))
            if (avgll !== undefined) {
              moveMap.move(avgll.lat, avgll.lng)
            }
          }
          setWaypoints(new WaypointCollection(new Map(parsedData)))
        }
      } catch (err) {
      }
    };

  };

  return <>
    <input type="file" accept=".json" id="fileInput" className="hidden" onChange={handleFileChange} />
    <Button onClick={() => document.getElementById('fileInput')?.click()}>
      <FaFileUpload className="inline" />Load JSON
    </Button>
  </>
}
