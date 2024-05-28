"use client";
import { useState } from 'react';
import { waypointContext } from './WaypointContext';
import { WaypointCollection, Node } from "@/types/waypoints";

type Props = {
  children: React.ReactNode;
};

const default_missions: [string, Node[]][] = [
  ["Main", []],
  ["Geofence", []],
]

export default function WaypointProvider({ children }: Props) {

  const [waypoints, setWaypoints] = useState<WaypointCollection>(new Map(default_missions))

  const [selectedWPs, setSelectedWPs] = useState<number[]>([]);

  const [activeMission, setActiveMission] = useState<string>("Main");

  return (
    <waypointContext.Provider value={{waypoints, setWaypoints, activeMission, setActiveMission, selectedWPs, setSelectedWPs}}>
      {children}
    </waypointContext.Provider>
  );
}
