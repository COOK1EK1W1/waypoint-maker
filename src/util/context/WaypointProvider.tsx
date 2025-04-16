"use client";
import { useState } from 'react';
import { syncStatusKeys, waypointContext } from './WaypointContext';
import { Tool } from '@/types/tools'
import { Mission } from "@/lib/mission/mission";
import { registerServiceWorker } from '@/lib/registerServiceWorker';

type Props = {
  children: React.ReactNode;
};

// The provider for the Waypoint State
export default function WaypointProvider({ children }: Props) {

  registerServiceWorker()

  const [waypoints, setWaypoints] = useState<Mission>(new Mission())

  // the selected waypoints | list of indexes of active mission
  const [selectedWPs, setSelectedWPs] = useState<number[]>([]);

  const [activeMission, setActiveMission] = useState<string>("Main");

  const [tool, setTool] = useState<Tool>("Waypoint")

  const [syncStatus, setSyncStatus] = useState<typeof syncStatusKeys[number]>("idle")

  return (
    <waypointContext.Provider value={{
      waypoints,
      setWaypoints,
      activeMission,
      setActiveMission,
      selectedWPs,
      setSelectedWPs,
      tool,
      setTool,
      syncStatus,
      setSyncStatus
    }} >
      {children}
    </ waypointContext.Provider>
  );
}
