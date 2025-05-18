"use client";
import { ReactNode, useEffect, useRef, useState } from 'react';
import { mapContext } from './MapContext';
import { Map } from 'leaflet';
import { createStore, get, set } from 'idb-keyval'

type Props = {
  children: ReactNode;
};

const providerStore = createStore('mapProvider', 'providerData')

export default function MapProvider({ children }: Props) {

  const mapRef = useRef<Map | null>(null)
  const [tileProvider, setTileProvider] = useState<{ subdomains: string[], url: string }>({ url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", subdomains: [] })

  useEffect(() => {
    console.log("running on startup")
    set("providerUrl", tileProvider.url, providerStore)
  }, [tileProvider])

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
