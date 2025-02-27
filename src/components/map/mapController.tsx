import { useMap } from "react-leaflet"
import { useMap as useMapContext } from '@/util/context/MapContext';
import { useEffect } from "react";

// This component handles map controls and updates the context
export default function MapController() {
  const map = useMap();
  const { setZoom, setCenter, moveMap } = useMapContext();

  useEffect(() => {
    // Update moveMap methods
    moveMap.move = (lat: number, lng: number) => {
      map.panTo([lat, lng]);
    };

    moveMap.zoom = (level: number) => {
      map.setZoom(level);
    };

    moveMap.panTo = (lat: number, lng: number, zoom?: number) => {
      map.setView([lat, lng], zoom || map.getZoom());
    };

    // Set up event listeners
    map.on('zoom', () => {
      setZoom(map.getZoom());
    });

    map.on('move', () => {
      const center = map.getCenter();
      setCenter({ lat: center.lat, lng: center.lng });
    });
    map.setView({ lat: 55.911879, lng: -3.319938 })

    return () => {
      map.off('zoom');
      map.off('move');
    };
  }, [map, setZoom, setCenter, moveMap]);

  return null;
}

