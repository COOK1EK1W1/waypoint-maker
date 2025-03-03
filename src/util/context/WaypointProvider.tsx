"use client";
import { useState } from 'react';
import { waypointContext } from './WaypointContext';
import { Tool } from '@/types/tools'
import { WaypointCollection } from '@/lib/waypoints/waypointCollection';

type Props = {
  children: React.ReactNode;
};

// The provider for the Waypoint State
export default function WaypointProvider({ children }: Props) {

  const [waypoints, setWaypoints] = useState<WaypointCollection>(new WaypointCollection())

  // the selected waypoints | list of indexes of active mission
  const [selectedWPs, setSelectedWPs] = useState<number[]>([]);

  const [activeMission, setActiveMission] = useState<string>("Main");

  const [tool, setTool] = useState<Tool>("Waypoint")

  return (
    <waypointContext.Provider value={{ 
      waypoints, 
      setWaypoints, 
      activeMission, 
      setActiveMission, 
      selectedWPs, 
      setSelectedWPs, 
      tool, 
      setTool 
    }} >
      {children}
    </ waypointContext.Provider>
  );
}
