"use client";
import { useEffect, useState } from 'react';
import { syncStatusKeys, waypointContext } from './WaypointContext';
import { Tool } from '@/types/tools'
import { Mission, Node } from "@/lib/mission/mission";

type Props = {
  children: React.ReactNode;
  mission: Map<string, Node[]>;
  missionId: string,
  ownerId: string
};

export default function CloudWaypointProvider({ children, mission, missionId, ownerId }: Props) {

  const [waypoints, setWaypoints] = useState<Mission>(new Mission(mission))

  const [selectedWPs, setSelectedWPs] = useState<number[]>([]);

  const [activeMission, setActiveMission] = useState<string>("Main");

  const [tool, setTool] = useState<Tool>("Waypoint")

  const [syncStatus, setSyncStatus] = useState<typeof syncStatusKeys[number]>("synced")

  useEffect(() => {
    setSyncStatus("notSynced")
  }, [waypoints])


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
      missionId,
      ownerId,
      syncStatus,
      setSyncStatus
    }} >
      {children}
    </ waypointContext.Provider>
  );
}
