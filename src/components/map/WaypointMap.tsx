"use client"

import { MapContainer, TileLayer, useMapEvent } from "react-leaflet"
import 'leaflet/dist/leaflet.css';
import { useWaypoints } from "../../util/context/WaypointContext";
import { Tool } from "@/types/tools";
import { LeafletMouseEvent, Map } from "leaflet";
import { useEffect, useRef } from "react";
import { defaultDoLandStart, defaultTakeoff, defaultWaypoint } from "@/lib/mission/defaults";
import { useMap } from '@/util/context/MapContext';
import MapController from "./mapController";
import MapLayers from "./layers/layers";
import { makeCommand } from "@/lib/commands/default";
import { Command, filterLatLngAltCmds, filterLatLngCmds } from "@/lib/commands/commands";
import { avgLatLng, getLatLng } from "@/lib/world/latlng";
import { Node } from "@/lib/mission/mission";

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
            waypoints.pushToMission(activeMission, { type: "Command", cmd: defaultWaypoint({ lat: Number(newLat), lng: Number(newLng) }) })
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

  useEffect(() => {
    const pos = avgLatLng(filterLatLngAltCmds(waypoints.flatten("Main")).map(getLatLng))
    if (mapRef.current != null && pos !== undefined) {
      mapRef.current.setView(pos)
    }
  }, [mapRef.current, moveMap])

  function handleClick(tool: Tool, e: LeafletMouseEvent) {
    if (activeMission == "Geofence") {
      setWaypoints((waypoints) => {
        let waypointsNew = waypoints.clone()
        waypointsNew.pushToMission(activeMission, { type: "Command", cmd: makeCommand("WM_CMD_FENCE", { latitude: e.latlng.lat, longitude: e.latlng.lng }) })
        return waypointsNew
      })
      return
    }
    if (activeMission == "Markers") {
      setWaypoints((waypoints) => {
        let waypointsNew = waypoints.clone()
        waypointsNew.pushToMission(activeMission, { type: "Command", cmd: makeCommand("WM_CMD_MARKER", { latitude: e.latlng.lat, longitude: e.latlng.lng }) })
        return waypointsNew
      })
      return
    }
    switch (tool) {
      case "Waypoint": {
        setWaypoints((waypoints) => {
          let waypointsNew = waypoints.clone()
          waypointsNew.pushToMission(activeMission, { type: "Command", cmd: defaultWaypoint(e.latlng) })
          return waypointsNew
        })
        break;
      }
      case "Takeoff": {
        setTool("Waypoint")
        setWaypoints((waypoints) => {
          const a = waypoints.clone()
          a.pushToMission(activeMission, { type: "Command", cmd: defaultTakeoff(e.latlng) })
          return a
        })
        break;
      }
      case "Landing": {
        setTool("Waypoint")
        setWaypoints((waypoints) => {
          const a = waypoints.clone()
          a.pushToMission(activeMission, { type: "Command", cmd: defaultDoLandStart(e.latlng) })
          return a
        })
        break;
      }
      case "Place": {
        setTool("Waypoint")
        setWaypoints((waypoints) => {
          const mission = waypoints.get(activeMission);

          let wps: Node[] = [];
          let wpsIds: number[] = [];
          if (selectedWPs.length === 0) {
            wps = mission;
            wpsIds = mission.map((_, index) => index);
          } else {
            wps = mission.filter((_, id) => selectedWPs.includes(id));
            wpsIds = selectedWPs;
          }

          const leaves = wps.map((x) => waypoints.flattenNode(x)).reduce((cur, acc) => (acc.concat(cur)), [])

          const avgll = avgLatLng(filterLatLngCmds(leaves).map(getLatLng))
          if (avgll == undefined) { return waypoints }
          const { lat, lng } = avgll
          let waypointsUpdated = waypoints.clone();
          for (let i = 0; i < wps.length; i++) {
            waypointsUpdated.changeParam(wpsIds[i], activeMission, (cmd: Command) => {
              if ("latitude" in cmd.params && "longitude" in cmd.params) {
                cmd.params.latitude += e.latlng.lat - lat
                cmd.params.longitude += e.latlng.lng - lng
              }
              return cmd;
            });
          }
          return waypointsUpdated;
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
      b.changeParam(pos, mission, (wp) => { if ("latitude" in wp.params) { wp.params.latitude = lat; wp.params.longitude = lng } return wp })
      return b
    })
    return

  }

  const { zoom, center } = useMap();

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

        <MapLayers onMove={onMove} />
      </MapContainer>
    );
  }
}
