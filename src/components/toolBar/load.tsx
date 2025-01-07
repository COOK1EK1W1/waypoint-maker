import { useWaypointContext } from '@/util/context/WaypointContext';
import React from 'react';
import Button from './button';
import { FaFileUpload } from 'react-icons/fa';
import { AvgLatLng } from '@/util/WPCollection';
import { WaypointCollection } from '@/types/waypoints';

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
        let wps: WaypointCollection = new Map(parsedData)
        let main = wps.get("Main")
        if (main) {
          if (moveMap.move) {
            const [lat, lng] = AvgLatLng(main, wps)
            moveMap.move(lat, lng)
          }
          setWaypoints(new Map(parsedData))
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
