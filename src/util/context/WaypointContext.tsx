"use client";
import { Dispatch, SetStateAction, createContext, useContext } from 'react';
import { Tool } from '@/types/tools';
import { Mission } from "@/lib/mission/mission";

export const syncStatusKeys = ["idle", "synced", "syncing", "notSynced"] as const

type provided = {
  waypoints: Mission,
  setWaypoints: Dispatch<SetStateAction<Mission>>,
  selectedWPs: number[]
  setSelectedWPs: Dispatch<SetStateAction<number[]>>,
  activeMission: string,
  setActiveMission: Dispatch<SetStateAction<string>>,
  tool: Tool,
  setTool: Dispatch<SetStateAction<Tool>>,
  missionId?: string,
  ownerId?: string,
  syncStatus: typeof syncStatusKeys[number],
  setSyncStatus: Dispatch<SetStateAction<typeof syncStatusKeys[number]>>
}

export const waypointContext = createContext<provided>(undefined as any);

export function useWaypoints() {
  const context = useContext(waypointContext);

  if (context === undefined) {
    throw new Error('No waypoint context provided');
  }

  return context;
}
