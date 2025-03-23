import ActiveLayer from "./activeLayer";
import DubinsLayer from "./dubinsLayer";
import GeofenceLayer from "./geofenceLayer";
import MarkerLayer from "./markerLayer";

export default function MapLayers({ onMove }: { onMove: (lat: number, lng: number, id: number) => void }) {
  return (
    <>
      <ActiveLayer onMove={onMove} />
      <GeofenceLayer onMove={onMove} />
      <MarkerLayer onMove={onMove} />
      <DubinsLayer />
    </>
  )

}
