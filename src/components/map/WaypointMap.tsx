"use client"

import { MapContainer, TileLayer, useMapEvent } from "react-leaflet"
import 'leaflet/dist/leaflet.css';
import { useWaypointContext } from "../../util/context/WaypointContext";
import { Tool } from "@/types/tools";
import { LeafletMouseEvent, Map } from "leaflet";
import { useEffect, useRef } from "react";
import ActiveLayer from "./activeLayer";
import GeofenceLayer from "./geofenceLayer";
import MarkerLayer from "./markerLayer";
import DubinsLayer from "./dunbinsLayer";
import { MoveWPsAvgTo } from "@/util/WPCollection";

const defaultWaypoint = (lat: number, lng: number,) => ({
  frame: 3,
  type: 16,
  param1: 0,
  param2: 0,
  param3: 0,
  param4: 0,
  param5: lat,
  param6: lng,
  param7: 100,
  autocontinue: 1
})

const defaultTakeoff = (lat: number, lng: number,) => ({
  frame: 3,
  type: 22,
  param1: 15,
  param2: 0,
  param3: 0,
  param4: 0,
  param5: lat,
  param6: lng,
  param7: 15,
  autocontinue: 1
})


export default function MapStuff() {
  const { waypoints, setWaypoints, activeMission, tool, setTool, moveMap, selectedWPs } = useWaypointContext()

  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    moveMap.move = (lat, lng) => {
      if (mapRef.current != null) {
        mapRef.current.setView({ lat: lat, lng: lng })
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
            waypoints.pushToMission(activeMission, { type: "Waypoint", wps: defaultWaypoint(Number(newLat), Number(newLng)) })
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
    const { lat, lng } = e.latlng
    switch (tool) {
      case "Waypoint": {
        setWaypoints((waypoints) => {
          let waypointsNew = waypoints.clone()
          waypointsNew.pushToMission(activeMission, { type: "Waypoint", wps: defaultWaypoint(lat, lng) })
          return waypointsNew
        })
        break;
      }
      case "Takeoff": {
        setTool("Waypoint")
        setWaypoints((waypoints) => {
          waypoints.pushToMission(activeMission, { type: "Waypoint", wps: defaultTakeoff(lat, lng) })
          return waypoints.clone()
        })
        break;
      }
      case "Place": {
        setTool("Waypoint")
        setWaypoints((waypoints) => {
          MoveWPsAvgTo(e.latlng.lat, e.latlng.lng, waypoints, selectedWPs, activeMission)
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
    console.log(lat, lng)
    if (a == null) return
    const [mission, pos] = a
    setWaypoints((waypoints2) => {
      const b = waypoints2.clone()
      b.changeParam(pos, mission, (wp) => { wp.param5 = lat; wp.param6 = lng; return wp })
      return b
    })
    return

  }

  if (typeof window != undefined) {

    const mission = waypoints.get(activeMission)
    if (mission == undefined) return

    return (

      <MapContainer
        center={{ lat: 55.91289, lng: -3.32560 }}
        zoom={13}
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

        <CreateHandler />

        <ActiveLayer onMove={onMove} />
        <GeofenceLayer onMove={onMove} />
        <MarkerLayer onMove={onMove} />
        <DubinsLayer />
      </MapContainer>
    );
  }
}
