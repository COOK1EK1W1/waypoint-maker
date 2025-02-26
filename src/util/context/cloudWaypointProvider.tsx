"use client";
import { useState } from 'react';
import { waypointContext } from './WaypointContext';
import { Tool } from '@/types/tools'
import { WaypointCollection } from '@/lib/waypoints/waypointCollection';
import { Node } from '@/types/waypoints';

type Props = {
  children: React.ReactNode;
  mission: Map<string, Node[]>;
  missionId: string
};

export default function CloudWaypointProvider({ children, mission, missionId }: Props) {

  const [waypoints, setWaypoints] = useState<WaypointCollection>(new WaypointCollection(mission))

  const [selectedWPs, setSelectedWPs] = useState<number[]>([]);

  const [activeMission, setActiveMission] = useState<string>("Main");

  const [tool, setTool] = useState<Tool>("Waypoint")
  return (
    <waypointContext.Provider value={{ waypoints, setWaypoints, activeMission, setActiveMission, selectedWPs, setSelectedWPs, tool, setTool, missionId }} >
      {children}
    </ waypointContext.Provider>
  );
}
