"use client";
import { useState } from 'react';
import { waypointContext } from './WaypointContext';
import { WaypointCollection } from "@/types/waypoints";
import { Tool } from '@/types/tools'

type Props = {
  children: React.ReactNode;
  mission: WaypointCollection;
};

export default function CloudWaypointProvider({ children, mission }: Props) {

  const [waypoints, setWaypoints] = useState<WaypointCollection>(mission)

  const [selectedWPs, setSelectedWPs] = useState<number[]>([]);

  const [activeMission, setActiveMission] = useState<string>("Main");

  const [tool, setTool] = useState<Tool>("Waypoint")
  return (
    <waypointContext.Provider value={{ waypoints, setWaypoints, activeMission, setActiveMission, selectedWPs, setSelectedWPs, tool, setTool, moveMap: {} }} >
      {children}
    </ waypointContext.Provider>
  );
}
