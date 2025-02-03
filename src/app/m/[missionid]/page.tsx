import { WMEditor } from "@/components/editor";
import ToolBar from "@/components/toolBar/ToolBar";
import { auth } from "@/util/auth";
import CloudWaypointProvider from "@/util/context/cloudWaypointProvider";
import VehicleProvider from "@/util/context/VehicleTypeProvider";
import prisma from "@/util/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Mission({ params }: { params: Promise<{ missionid: string }> }) {
  const missionId = (await params).missionid

  let data = await auth.api.getSession({ headers: await headers() })
  const a = await prisma.mission.findUnique({ where: { id: missionId, userId: data?.user.id } })
  if (a == null) {
    return redirect("/")
  }

  let b = JSON.parse(a.data)

  return (
    <CloudWaypointProvider mission={new Map(b)} missionId={missionId}>
      <VehicleProvider >
        <ToolBar />
        <WMEditor />
      </VehicleProvider >
    </CloudWaypointProvider >
  )
}
