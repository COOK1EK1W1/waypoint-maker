"use client";
import { Dispatch, SetStateAction, createContext, useContext } from 'react';
import { Tool } from '@/types/tools';
import { WaypointCollection } from '@/lib/waypoints/waypointCollection';

type provided = {
  waypoints: WaypointCollection,
  setWaypoints: Dispatch<SetStateAction<WaypointCollection>>,
  selectedWPs: number[]
  setSelectedWPs: Dispatch<SetStateAction<number[]>>,
  activeMission: string,
  setActiveMission: Dispatch<SetStateAction<string>>,
  tool: Tool,
  setTool: Dispatch<SetStateAction<Tool>>,
  missionId?: string
}

export const waypointContext = createContext<provided>(undefined as any);

export function useWaypoints() {
  const context = useContext(waypointContext);

  if (context === undefined) {
    throw new Error('No waypoint context provided');
  }

  return context;
}
