"use client";
import { useState } from 'react';
import { waypointContext } from './WaypointContext';
import { Tool } from '@/types/tools'
import { WaypointCollection } from '@/lib/waypoints/waypointCollection';

type Props = {
  children: React.ReactNode;
};

export default function WaypointProvider({ children }: Props) {

  const [waypoints, setWaypoints] = useState<WaypointCollection>(new WaypointCollection())

  const [selectedWPs, setSelectedWPs] = useState<number[]>([]);

  const [activeMission, setActiveMission] = useState<string>("Main");

  const [tool, setTool] = useState<Tool>("Waypoint")
  return (
    <waypointContext.Provider value={{ waypoints, setWaypoints, activeMission, setActiveMission, selectedWPs, setSelectedWPs, tool, setTool, moveMap: {} }} >
      {children}
    </ waypointContext.Provider>
  );
}
