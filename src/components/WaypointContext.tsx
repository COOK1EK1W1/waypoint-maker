"use client";
import { Dispatch, SetStateAction, createContext, useContext } from 'react';

export const waypointContext = createContext<[Waypoint[], Dispatch<SetStateAction<Waypoint[]>>]>(undefined as any);

export function useWaypointContext() {
  const context = useContext(waypointContext);

  if (context === undefined) {
    throw new Error('No deadlines context provided');
  }

  return context;
}