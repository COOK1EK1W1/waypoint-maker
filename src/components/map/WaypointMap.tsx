"use client"

import { MapContainer, Polygon, Polyline, TileLayer, useMapEvent } from "react-leaflet"
import 'leaflet/dist/leaflet.css';
import DraggableMarker from "../marker/DraggableMarker";
import { useWaypointContext } from "../../util/context/WaypointContext";
import { toPolyline } from "@/util/waypointToLeaflet";
import { AvgLatLng, MoveWPsAvgTo, add_waypoint, changeParam, findnthwaypoint, get_waypoints } from "@/util/WPCollection";
import { Tool } from "@/types/tools";
import { LeafletMouseEvent } from "leaflet";
import { Node, Waypoint } from "@/types/waypoints";


const fenceOptions = { color: 'red', fillOpacity: 0.1 }
const limeOptions = { color: 'lime' }

export default function MapStuff() {
  const {waypoints, setWaypoints, activeMission, tool, setTool, selectedWPs} = useWaypointContext()

  function handleClick(tool: Tool, e: LeafletMouseEvent){
    switch (tool){
      case "Waypoint": {

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
      <div className="">


        <MapContainer 
          center={{ lat: 55.91289, lng: -3.32560 }}
          zoom={13} 
          style={{ width: '100%', height: '800px' }}
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

          <Polygon pathOptions={fenceOptions} positions={toPolyline(get_waypoints("Geofence", waypoints))} />

        </MapContainer>
      </div>
    );
  }
}
