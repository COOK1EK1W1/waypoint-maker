import { useMap } from "react-leaflet"
import { useEffect, useRef } from "react";
import { useWaypoints } from "@/util/context/WaypointContext";
import { avgLatLng, getLatLng } from "@/lib/world/latlng";
import { filterLatLngAltCmds } from "@/lib/commands/commands";

// This component handles map controls and updates the context
export default function MapController() {
  const map = useMap();
  const { waypoints } = useWaypoints()

  // capture waypoints only once
  const initialWaypoints = useRef(waypoints)

  // on load move to average location of waypoints
  useEffect(() => {
    const pos = avgLatLng(filterLatLngAltCmds(initialWaypoints.current.flatten("Main")).map(getLatLng))
    if (pos != undefined) {
      map.setView(pos)
    } else {
      map.setView({ lat: 55.911879, lng: -3.319938 })
    }
  }, [map]);

  return null;
}

