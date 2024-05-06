"use client"

import { MapContainer, Polyline, TileLayer, useMapEvent } from "react-leaflet"
import 'leaflet/dist/leaflet.css';
import DraggableMarker from "../marker/DraggableMarker";
import { useWaypointContext } from "../../util/context/WaypointContext";
import { toPolyline } from "@/util/waypointToLeaflet";
import { add_waypoint, get_waypoints } from "@/util/WPCollection";


const limeOptions = { color: 'lime' }

export default function MapStuff() {
  const {waypoints, setWaypoints, activeMission} = useWaypointContext()

  // Handler function to add marker
  function CreateHandler(){
    useMapEvent("click", (e)=>{
      const mission = waypoints.get(activeMission)
      if (mission == null) return

      const newMarker = {
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
      setWaypoints(add_waypoint(activeMission, {type:"Waypoint", wps:newMarker}, waypoints));

    })
    return null
  }

  function onMove(lat: number, lng: number, id: number){
    setWaypoints(prevWaypoints => {
      let wps = prevWaypoints.get(activeMission)
      if (wps == undefined) return prevWaypoints
      const prevWP = wps[id]
      if (prevWP.type != "Waypoint") return prevWaypoints
      wps[id] = {...prevWP, wps: {...prevWP.wps, param5: lat, param6: lng}}
      prevWaypoints.set(activeMission, wps)
      return new Map(prevWaypoints)
    })

  }

  if (typeof window != undefined){

    const mission = waypoints.get(activeMission)
    if (mission == undefined) return

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

          {get_waypoints(activeMission, waypoints).map((waypoint, idx) => 
            <DraggableMarker key={idx} waypoint={waypoint} onMove={(lat, lng)=>onMove(lat, lng, idx)} active={false}/>
          )}
          <Polyline pathOptions={limeOptions} positions={toPolyline(get_waypoints(activeMission, waypoints))} />
          <CreateHandler/>

        </MapContainer>
      </div>
    );
  }
}
