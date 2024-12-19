"use client"

import { MapContainer, TileLayer, useMapEvent } from "react-leaflet"
import 'leaflet/dist/leaflet.css';
import { useWaypointContext } from "../../util/context/WaypointContext";
import { MoveWPsAvgTo, add_waypoint, changeParam, findnthwaypoint } from "@/util/WPCollection";
import { Tool } from "@/types/tools";
import { LeafletMouseEvent } from "leaflet";
import { useEffect } from "react";
import ActiveLayer from "./activeLayer";
import GeofenceLayer from "./geofenceLayer";
import MarkerLayer from "./markerLayer";
import DubinsLayer from "./dunbinsLayer";



export default function MapStuff() {
  const {waypoints, setWaypoints, activeMission, tool, setTool, selectedWPs} = useWaypointContext()

  useEffect(()=>{
    function handleKeyPress(e: KeyboardEvent){
      switch(e.key){
        case 'n':{

          const newLat = prompt("Enter latitude");
          const newLng = prompt("Enter Longitude");
          if (newLat == null || newLng == null) return

          const mission = waypoints.get(activeMission)
          if (mission == null) return

          const newMarker = {
            frame: 3,
            type: 16,
            param1: 0,
            param2: 0,
            param3: 0,
            param4: 0,
            param5: Number(newLat),
            param6: Number(newLng),
            param7: 100,
            autocontinue: 1
          };
          setWaypoints(add_waypoint(activeMission, {type:"Waypoint", wps:newMarker}, waypoints));
          break;

        }
        default: return
      }

    }
    window.addEventListener('keypress', handleKeyPress)

    return ()=>{
      window.removeEventListener('keypress', handleKeyPress)

    }

  },[activeMission, setWaypoints, waypoints])

  function handleClick(tool: Tool, e: LeafletMouseEvent){
    switch (tool){
      case "Waypoint": {

        const mission = waypoints.get(activeMission)
        if (mission == null) return

        const newMarker = {
          frame: 3,
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
        break;
      }
      case "Takeoff": {
        setTool("Waypoint")
        const mission = waypoints.get(activeMission)
        if (mission == null) return

        const newMarker = {
          frame: 3,
          type: 22,
          param1: 15,
          param2: 0,
          param3: 0,
          param4: 0,
          param5: e.latlng.lat,
          param6: e.latlng.lng,
          param7: 15,
          autocontinue: 1
        };
        setWaypoints(add_waypoint(activeMission, {type:"Waypoint", wps:newMarker}, waypoints));
        break;
      }
      case "Place":{
        setTool("Waypoint")
        setWaypoints(MoveWPsAvgTo(e.latlng.lat, e.latlng.lng, waypoints, selectedWPs, activeMission))
        break;
      }
      default: 
        const _exhaustiveCheck: never = tool
        return _exhaustiveCheck
    }
  }


  // Handler function to add marker
  function CreateHandler(){
    useMapEvent("click", (e)=>{
      handleClick(tool, e)
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

        <MapContainer 
          center={{ lat: 55.91289, lng: -3.32560 }}
          zoom={13} 
          style={{ width: '100%', height: '100%'}}
        className="z-10"
        >
          <TileLayer
            url='https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            maxZoom= {20}
            subdomains={['mt1','mt2','mt3']}/>

          <CreateHandler/>
          
          <ActiveLayer onMove={onMove}/>
          <GeofenceLayer onMove={onMove} />
          <MarkerLayer onMove={onMove}/>
          <DubinsLayer/>
        </MapContainer>
    );
  }
}
