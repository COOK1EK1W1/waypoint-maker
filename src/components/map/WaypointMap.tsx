"use client"

import { MapContainer, TileLayer, useMapEvent } from "react-leaflet"
import 'leaflet/dist/leaflet.css';
import { useWaypoints } from "../../util/context/WaypointContext";
import { Tool } from "@/types/tools";
import { LeafletMouseEvent, Map } from "leaflet";
import { useEffect, useRef } from "react";
import ActiveLayer from "./activeLayer";
import GeofenceLayer from "./geofenceLayer";
import MarkerLayer from "./markerLayer";
import DubinsLayer from "./dubinsLayer";
import { MoveWPsAvgTo } from "@/util/WPCollection";
import { defaultDoLandStart, defaultTakeoff, defaultWaypoint } from "@/lib/waypoints/defaults";
import { useMap } from '@/util/context/MapContext';
import MapController from "./mapController";

export default function MapStuff() {
  const { waypoints, setWaypoints, activeMission, tool, setTool, selectedWPs } = useWaypoints()
  const { moveMap } = useMap();

  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    moveMap.move = (lat, lng) => {
      if (mapRef.current != null) {
        mapRef.current.setView({ lat, lng })
      }
    }

    // Keyboard shortcuts
    function handleKeyPress(e: KeyboardEvent) {
      switch (e.key) {
        case 'n': {
          const newLat = prompt("Enter latitude");
          const newLng = prompt("Enter Longitude");
          if (newLat == null || newLng == null) return


          setWaypoints((waypoints) => {
            waypoints.pushToMission(activeMission, { type: "Waypoint", wps: defaultWaypoint({ lat: Number(newLat), lng: Number(newLng) }) })
            return waypoints.clone()
          })
          break;

        }
        default: return
      }

    }
    window.addEventListener('keypress', handleKeyPress)

    return () => {
      window.removeEventListener('keypress', handleKeyPress)
    }

  }, [activeMission, setWaypoints, waypoints, moveMap])

  function handleClick(tool: Tool, e: LeafletMouseEvent) {
    switch (tool) {
      case "Waypoint": {
        setWaypoints((waypoints) => {
          let waypointsNew = waypoints.clone()
          waypointsNew.pushToMission(activeMission, { type: "Waypoint", wps: defaultWaypoint(e.latlng) })
          return waypointsNew
        })
        break;
      }
      case "Takeoff": {
        setTool("Waypoint")
        setWaypoints((waypoints) => {
          const a = waypoints.clone()
          a.pushToMission(activeMission, { type: "Waypoint", wps: defaultTakeoff(e.latlng) })
          return a
        })
        break;
      }
      case "Landing": {
        setTool("Waypoint")
        setWaypoints((waypoints) => {
          const a = waypoints.clone()
          a.pushToMission(activeMission, { type: "Waypoint", wps: defaultDoLandStart(e.latlng) })
          return a
        })
        break;
      }
      case "Place": {
        setTool("Waypoint")
        setWaypoints((waypoints) => {
          MoveWPsAvgTo(e.latlng, waypoints, selectedWPs, activeMission)
          return waypoints
        })
        break;
      }
      default:
        const _exhaustiveCheck: never = tool
        return _exhaustiveCheck
    }
  }


  // Handler function to add marker
  function CreateHandler() {
    useMapEvent("click", (e) => {
      handleClick(tool, e)
    })
    return null
  }

  function onMove(lat: number, lng: number, id: number) {
    const a = waypoints.findNthPosition(activeMission, id)
    if (a == null) return
    const [mission, pos] = a
    setWaypoints((waypoints2) => {
      const b = waypoints2.clone()
      b.changeParam(pos, mission, (wp) => { wp.param5 = lat; wp.param6 = lng; return wp })
      return b
    })
    return

  }

  const { zoom, center } = useMap();
  console.log(center)

  if (typeof window != undefined) {

    return (
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        className="z-10"
        ref={mapRef}
        attributionControl={false}
        zoomControl={false}
        keyboard={false}
        fadeAnimation={false}
      >
        <TileLayer
          url='https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
          maxZoom={20}
          subdomains={['mt1', 'mt2', 'mt3']} />

        <MapController />

        <CreateHandler />

        <ActiveLayer onMove={onMove} />
        <GeofenceLayer onMove={onMove} />
        <MarkerLayer onMove={onMove} />
        <DubinsLayer />
      </MapContainer>
    );
  }
}
