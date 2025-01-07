import { WMEditor } from "@/components/editor";
import WaypointProvider from '@/util/context/WaypointProvider'
import VehicleProvider from '@/util/context/VehicleTypeProvider'
import ToolBar from "@/components/toolBar/ToolBar";

export default async function Home() {
  return (
    <WaypointProvider>
      <VehicleProvider>
        <ToolBar />
        <WMEditor />
      </VehicleProvider>
    </WaypointProvider>


  );
}
