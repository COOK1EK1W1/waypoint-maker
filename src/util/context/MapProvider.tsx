"use client";
import { ReactNode, useState } from 'react';
import { mapContext } from './MapContext';

type Props = {
  children: ReactNode;
};

export default function MapProvider({ children }: Props) {
  const [moveMap, setMoveMap] = useState({ 
    move: undefined,
    zoom: undefined,
    panTo: undefined
  });
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState({ lat: 0, lng: 0 });

  return (
    <mapContext.Provider value={{ 
      moveMap,
      zoom,
      setZoom,
      center,
      setCenter
    }}>
      {children}
    </mapContext.Provider>
  );
} 