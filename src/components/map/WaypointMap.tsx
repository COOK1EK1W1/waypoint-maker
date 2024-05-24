"use client"

import { MapContainer, Polyline, TileLayer, useMapEvent } from "react-leaflet"
import 'leaflet/dist/leaflet.css';
import DraggableMarker from "../marker/DraggableMarker";
import { useWaypointContext } from "../../util/context/WaypointContext";
import { toPolyline } from "@/util/waypointToLeaflet";
import { add_waypoint, changeParam, findnthwaypoint, get_waypoints } from "@/util/WPCollection";
import GeofenceMarker from "../marker/geofenceMarker";


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
    const a = findnthwaypoint(activeMission, id, waypoints) 
    if (a == null) return
    const [mission, pos] = a
    setWaypoints(new Map(changeParam(pos, mission, waypoints, (wp)=>({...wp, param5: lat, param6:lng}))))

  }

  if (typeof window != undefined){

    const mission = waypoints.get(activeMission)
    if (mission == undefined) return

    return (
      <div className="">


        <MapContainer 
          center={{ lat: 55.91289, lng: -3.32560 }}
          zoom={13} 
          style={{ width: '100%', height: '500px' }}
        >
          <TileLayer
            url='https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            maxZoom= {20}
            subdomains={['mt1','mt2','mt3']}
          />

          {get_waypoints(activeMission, waypoints).map((waypoint, idx) => 
            <DraggableMarker key={idx} waypoint={waypoint} onMove={(lat, lng)=>onMove(lat, lng, idx)} active={false}/>
          )}
          <Polyline pathOptions={limeOptions} positions={toPolyline(get_waypoints(activeMission, waypoints))} />
          <CreateHandler/>

          {get_waypoints("geofence", waypoints).map((waypoint, idx) =>
            <GeofenceMarker key={idx} waypoint={waypoint} active={false}/>
          )}
          <Polyline pathOptions={limeOptions} positions={toPolyline(get_waypoints("geofence", waypoints))} />

        </MapContainer>
      </div>
    );
  }
}
