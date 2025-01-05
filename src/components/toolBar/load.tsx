import { useWaypointContext } from '@/util/context/WaypointContext';
import React from 'react';
import Button from './button';
import { FaFileUpload } from 'react-icons/fa';

export default function LoadJson() {
  const { setWaypoints } = useWaypointContext();

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
        setWaypoints(new Map(parsedData))
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
