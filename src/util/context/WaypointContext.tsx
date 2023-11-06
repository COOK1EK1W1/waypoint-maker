"use client";
import { Dispatch, SetStateAction, createContext, useContext } from 'react';

export const waypointContext = createContext<{waypoints: Waypoint[], setWaypoints: Dispatch<SetStateAction<Waypoint[]>>, active: number|null, setActive: Dispatch<SetStateAction<number|null>>}>(undefined as any);

export function useWaypointContext() {
  const context = useContext(waypointContext);

  if (context === undefined) {
    throw new Error('No deadlines context provided');
  }

  return context;
}