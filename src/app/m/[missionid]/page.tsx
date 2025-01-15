import { WMEditor } from "@/components/editor";
import ToolBar from "@/components/toolBar/ToolBar";
import CloudWaypointProvider from "@/util/context/cloudWaypointProvider";
import VehicleProvider from "@/util/context/VehicleTypeProvider";
import prisma from "@/util/prisma";

export default async function Mission({ params }: { params: Promise<{ missionid: string }> }) {
  const a = await prisma.mission.findUnique({ where: { id: (await params).missionid } })
  if (a == null) {
    return null
  }

  let b = JSON.parse(a.data)

  return (
    <CloudWaypointProvider mission={new Map(b)}>
      <VehicleProvider >
        <ToolBar />
        <WMEditor />
      </VehicleProvider >
    </CloudWaypointProvider >
  )
}
