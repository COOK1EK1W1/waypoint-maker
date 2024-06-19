"use client";
import { Dispatch, SetStateAction, createContext, useContext } from 'react';
import {WaypointCollection} from "@/types/waypoints"
import { Tool } from '@/types/tools';

type provided = {
  waypoints: WaypointCollection, 
  setWaypoints: Dispatch<SetStateAction<WaypointCollection>>,
  selectedWPs: number[] 
  setSelectedWPs: Dispatch<SetStateAction<number[]>>,
  activeMission: string,
  setActiveMission: Dispatch<SetStateAction<string>>,
  tool: Tool,
  setTool :Dispatch<SetStateAction<Tool>>
}

export const waypointContext = createContext<provided>(undefined as any);

export function useWaypointContext() {
  const context = useContext(waypointContext);

  if (context === undefined) {
    throw new Error('No deadlines context provided');
  }

  return context;
}
