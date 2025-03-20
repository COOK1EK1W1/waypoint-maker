import { WMEditor } from "@/components/editor";
import WaypointProvider from '@/util/context/WaypointProvider'
import VehicleProvider from '@/util/context/VehicleTypeProvider'
import MapProvider from '@/util/context/MapProvider'
import ToolBar from "./toolBar";

export default async function Home() {
  return (
    <WaypointProvider>
      <VehicleProvider>
        <MapProvider>
          <ToolBar />
          <WMEditor />
        </MapProvider>
      </VehicleProvider>
    </WaypointProvider>
  );
}
