"use client";
import { ReactNode, useRef, useState } from 'react';
import { mapContext } from './MapContext';
import { Map } from 'leaflet';

type Props = {
  children: ReactNode;
};

export default function MapProvider({ children }: Props) {

  const mapRef = useRef<Map | null>(null)
  const [tileProvider, setTileProvider] = useState<string>("https://tile.openstreetmap.org/{z}/{x}/{y}.png")

  return (
    <mapContext.Provider value={{
      mapRef,
      tileProvider,
      setTileProvider,
    }}>
      {children}
    </mapContext.Provider>
  );
} 
