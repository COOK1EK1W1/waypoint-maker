"use client"
import { useWaypointContext } from '@/util/context/WaypointContext';
import React from 'react';
import Button from '@/components/toolBar/button';
import { FaFileUpload } from 'react-icons/fa';
import { avgLatLng } from '@/util/WPCollection';
import { WaypointCollection } from '@/lib/waypoints/waypointCollection';

export default function LoadJson() {
  const { setWaypoints, moveMap } = useWaypointContext();

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
            const { lat, lng } = avgLatLng(wps.flatten("Main"))
            moveMap.move(lat, lng)
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
