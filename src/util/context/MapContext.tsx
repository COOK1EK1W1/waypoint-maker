"use client";
import { createContext, Dispatch, MutableRefObject, SetStateAction, useContext } from 'react';
import { Map } from "leaflet";

export const mapElements = [
  "markers",
  "geofence",
] as const

type MapContextType = {
  mapRef: MutableRefObject<Map | null>;
  tileProvider: { subdomains: string[], url: string },
  setTileProvider: Dispatch<SetStateAction<{ subdomains: string[], url: string }>>
  viewable: { [K in (typeof mapElements)[number]]: boolean },
  setViewable: Dispatch<SetStateAction<{ [K in (typeof mapElements)[number]]: boolean }>>
}

export const mapContext = createContext<MapContextType>(undefined as any);

export function useMap() {
  const context = useContext(mapContext);

  if (context === undefined) {
    throw new Error('No map context provided');
  }

  return context;
} 
