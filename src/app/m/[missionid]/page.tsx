import { WMEditor } from "@/components/editor";
import ToolBar from "@/components/toolBar/ToolBar";
import { importwpm1 } from "@/lib/missionIO/wm1/spec";
import { importwpm2, isValidMission } from "@/lib/missionIO/wm2/spec";
import { auth } from "@/util/auth";
import CloudWaypointProvider from "@/util/context/cloudWaypointProvider";
import MapProvider from "@/util/context/MapProvider";
import VehicleProvider from "@/util/context/VehicleTypeProvider";
import prisma from "@/util/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Mission({ params }: { params: Promise<{ missionid: string }> }) {
  const missionId = (await params).missionid

  let data = await auth.api.getSession({ headers: await headers() })
  const a = await prisma.mission.findUnique({ where: { id: missionId } })
  if (a == null) {
    return redirect("/")
  }
  if (a.public === false && a.userId !== data?.user.id) {
    return redirect("/")
  }

  const wps = importwpm2(a.data) || importwpm1(a.data)
  if (wps === undefined) {
    throw new Error("bruh")
  }
  if (!isValidMission(wps.mission)) { console.assert("not valid") }

  return (
    <CloudWaypointProvider mission={wps.mission.destructure()} missionId={missionId}>
      <VehicleProvider vehicle={wps.vehicle}>
        <MapProvider>
          <ToolBar />
          <WMEditor />
        </MapProvider>
      </VehicleProvider >
    </CloudWaypointProvider >
  )
}
