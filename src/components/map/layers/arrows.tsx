// ArrowHead.tsx
import { useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import { LatLng } from "@/lib/world/types";

type ArrowHeadProps = {
  center: LatLng;
  direction: number;
};

export default function ArrowHead({ center, direction }: ArrowHeadProps) {
  const icon = useMemo(() => {
    const size = 20;
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${direction}deg);">
        <polygon points="10,0 20,20 10,15 0,20" fill="#5353FA" />
      </svg>
    `;

    return L.divIcon({
      className: "",
      html: svg,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }, [direction]);

  return <Marker position={center} icon={icon} interactive={false} />;
};


