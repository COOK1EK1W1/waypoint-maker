import { WMEditor } from "@/components/editor";
import WaypointProvider from '@/util/context/WaypointProvider'
import VehicleProvider from '@/util/context/VehicleTypeProvider'
import MapProvider from '@/util/context/MapProvider'
import ToolBar from "@/components/toolBar/ToolBar";

export default async function Home() {
  return (
    <VehicleProvider>
      <WaypointProvider>
        <MapProvider>
          <ToolBar isStatic={false} />
          <WMEditor />
        </MapProvider>
      </WaypointProvider>
    </VehicleProvider>
  );
}
