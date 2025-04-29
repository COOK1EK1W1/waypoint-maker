import { WMEditor } from "@/components/editor";
import WaypointProvider from '@/util/context/WaypointProvider'
import VehicleProvider from '@/util/context/VehicleTypeProvider'
import MapProvider from '@/util/context/MapProvider'
import ToolBar from "@/components/toolBar/ToolBar";

export default async function Home() {
  return (
    <WaypointProvider>
      <VehicleProvider>
        <MapProvider>
          <ToolBar isStatic={true} />
          <WMEditor />
        </MapProvider>
      </VehicleProvider>
    </WaypointProvider>
  );
}
