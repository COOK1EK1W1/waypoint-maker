import { getData } from "@/util/commandTypes";
import { useState } from "react";
import { useWaypointContext } from "../WaypointContext";
import { commandTypes } from "@/util/commandTypes";


export default function WaypointTypeSelector(){
  const {active, waypoints, setWaypoints} = useWaypointContext()
  
  function bruh(e :React.ChangeEvent<HTMLSelectElement>){
    const newType = parseInt(e.target.selectedOptions[0].getAttribute('data-cmd') || '0', 10);

    // Update the waypoints with the new type for the active waypoint
    setWaypoints((prevWaypoints)=>{
      let newWaypoints = [...prevWaypoints];
      let updatedWaypoint = { ...prevWaypoints[active || 0] };
      updatedWaypoint.type = newType
      newWaypoints[active || 0] = updatedWaypoint;

      return newWaypoints;
    })
  }
  commandTypes[commandTypes.findIndex(a => a.value==waypoints[active || 0].type)].name

  return (
    <div>
      <select onChange={bruh} value={  commandTypes[commandTypes.findIndex(a => a.value==waypoints[active || 0].type)].name}>
        {commandTypes.map((cmd, index) => (
          <option key={index} data-cmd={cmd.value}>{cmd.name}</option>
        ))}
      </select>
    </div>
  );
}