import { useWaypointContext } from '@/util/context/WaypointContext';
import React from 'react';

export default function LoadJson(){
  const { setWaypoints, waypoints } = useWaypointContext();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files){
      return
    }

    const file = event.target.files[0];

    if (!file) {
      console.error("please select a file first")
      return;
    }

    const reader = new FileReader();
    reader.readAsText(file)

    reader.onload = ()=>{
      try {
        const parsedData = JSON.parse(reader.result);
        console.log(parsedData)
        console.log(waypoints)
        setWaypoints(new Map(parsedData))
      } catch (err) {
        console.error("error parsing json" + err.message)
      }
    };

  };

  return (
    <div>
      <input type="file" accept=".json" id="fileInput" className="hidden" onChange={handleFileChange} />
      <button onClick={() => document.getElementById('fileInput').click()}>
        Load JSON
      </button>
    </div>
  )
}
