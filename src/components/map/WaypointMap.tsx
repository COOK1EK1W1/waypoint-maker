"use client"

import { MapContainer, Polyline, TileLayer, useMapEvent } from "react-leaflet"
import { useState } from "react";
import 'leaflet/dist/leaflet.css';
import DraggableMarker from "../marker/DraggableMarker";
import { useWaypointContext } from "../../util/context/WaypointContext";
import { toPolyline } from "@/util/waypointToLeaflet";


const limeOptions = { color: 'lime' }

export default function MapStuff() {
  let {waypoints, setWaypoints} = useWaypointContext()

  // Handler function to add marker
  function CreateHandler(){
    useMapEvent("click", (e)=>{
      const newMarker = {
          id: waypoints.length,
          frame: 0,
          type: 16,
          param1: 0,
          param2: 0,
          param3: 0,
          param4: 0,
          param5: e.latlng.lat,
          param6: e.latlng.lng,
          param7: 100,
          autocontinue: 1
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
          <Polyline pathOptions={limeOptions} positions={toPolyline(waypoints)} />
          <CreateHandler/>
          
        </MapContainer>
    </div>
  );
}
}
