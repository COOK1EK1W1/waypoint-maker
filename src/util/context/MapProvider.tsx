"use client";
import { ReactNode, useEffect, useRef, useState } from 'react';
import { mapContext } from './MapContext';
import { Map } from 'leaflet';
import { createStore, set, getMany } from 'idb-keyval'
import { registerServiceWorker } from '@/lib/registerServiceWorker';

const providerStore = createStore('mapProvider', 'providerData')

type Props = {
  children: ReactNode;
};

export default function MapProvider({ children }: Props) {
  const mapRef = useRef<Map | null>(null)

  // the tile provider for imagery
  const [tileProvider, setTileProvider] = useState<{ subdomains: string[], url: string }>({ url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", subdomains: ["a", "b", "c"] })

  useEffect(() => {
    // set the tile provider based on indexDB on first load
    getMany(["providerUrl", "providerDomains"], providerStore).then((x) => {
      if (x === undefined) return
      setTileProvider({ url: x[0], subdomains: x[1].split(", ") })
    })

    // register the service worker
    registerServiceWorker()
  }, [])

  // add the tile provider to the indexDB, so the service worker knows what it's looking for 
  // also for persistence on next load
  useEffect(() => {
    set("providerUrl", tileProvider.url, providerStore)
    set("providerDomains", tileProvider.subdomains.join(", "), providerStore)
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
