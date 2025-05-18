"use client";
import { ReactNode, useEffect, useRef, useState } from 'react';
import { mapContext } from './MapContext';
import { Map } from 'leaflet';
import { createStore, set } from 'idb-keyval'

type Props = {
  children: ReactNode;
};

const providerStore = createStore('mapProvider', 'providerData')

export default function MapProvider({ children }: Props) {

  const mapRef = useRef<Map | null>(null)

  // the tile provider for imagery
  const [tileProvider, setTileProvider] = useState<{ subdomains: string[], url: string }>({ url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", subdomains: ["a", "b", "c"] })

  //TODO: set the tile provider based on indexDB

  // add the tile provider to the indexDB, so the service worker knows what it's looking for 
  useEffect(() => {
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
