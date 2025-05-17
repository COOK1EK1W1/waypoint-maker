"use client";
import { ReactNode, useRef, useState } from 'react';
import { mapContext } from './MapContext';
import { Map } from 'leaflet';

type Props = {
  children: ReactNode;
};

export default function MapProvider({ children }: Props) {

  const mapRef = useRef<Map | null>(null)
  const [tileProvider, setTileProvider] = useState<{ subdomains: string[], url: string }>({ url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", subdomains: [] })

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
