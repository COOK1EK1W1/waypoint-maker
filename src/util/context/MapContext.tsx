"use client";
import { createContext, useContext } from 'react';

type MapContextType = {
  moveMap: {
    move?: (lat: number, lng: number) => void;
    zoom?: (level: number) => void;
    panTo?: (lat: number, lng: number, zoom?: number) => void;
  };
  zoom: number;
  setZoom: (zoom: number) => void;
  center: {
    lat: number;
    lng: number;
  };
  setCenter: (center: { lat: number; lng: number }) => void;
}

const defaultContext: MapContextType = {
  moveMap: {},
  zoom: 13,
  setZoom: () => { },
  center: { lat: 55.911879, lng: -3.319938 },
  setCenter: () => { }
};

export const mapContext = createContext<MapContextType>(defaultContext);

export function useMap() {
  const context = useContext(mapContext);

  if (context === undefined) {
    throw new Error('No map context provided');
  }

  return context;
} 
