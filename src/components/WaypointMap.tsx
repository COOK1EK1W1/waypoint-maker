"use client"

import { MapContainer, Polyline, TileLayer, useMapEvent } from "react-leaflet"
import { useState } from "react";
import 'leaflet/dist/leaflet.css';
import DraggableMarker from "./DraggableMarker";
import { useWaypointContext } from "./WaypointContext";


const limeOptions = { color: 'lime' }

export default function MapStuff() {
  let {waypoints, setWaypoints} = useWaypointContext()

  // Handler function to add marker
  function Yourmum(){
    useMapEvent("click", (e)=>{
      const newMarker = {
          id: waypoints.length,
          lat: e.latlng.lat,
          lng: e.latlng.lng
      };
      setWaypoints(prevMarkers => [...prevMarkers, newMarker]);

    })
    return null
  }

  if (typeof window != undefined){
return (
    <div className="flex-grow">


      <MapContainer 
          center={{ lat: 55.91289, lng: -3.32560 }}
          zoom={13} 
          style={{ width: '100%', height: '500px' }}
      >
          <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {waypoints.map((waypoint, idx) => 
            <DraggableMarker id={idx} key={idx}/>
          )}
          <Polyline pathOptions={limeOptions} positions={waypoints} />
          <Yourmum/>
          
        </MapContainer>
    </div>
  );
}
}
