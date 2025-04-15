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

  // get the user data
  let userData = await auth.api.getSession({ headers: await headers() })
  const missionData = await prisma.mission.findUnique({ where: { id: missionId } })
  if (missionData == null) {
    redirect("/no-exist")
  }

  // check if mission is public, redirect if user cannot access
  if (missionData.public === false && missionData.userId !== userData?.user.id) {
    redirect("/no-access")
  }

  // import the mission from the data
  const mission = importwpm2(missionData.data) || importwpm1(missionData.data)

  if (mission === undefined || !isValidMission(mission.mission)) {
    redirect("/no-parse")
  }

  return (
    <CloudWaypointProvider mission={mission.mission.destructure()} missionId={missionId}>
      <VehicleProvider vehicle={mission.vehicle}>
        <MapProvider>
          <ToolBar />
          <WMEditor />
        </MapProvider>
      </VehicleProvider >
    </CloudWaypointProvider >
  )
}
