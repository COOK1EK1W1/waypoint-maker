import { WMEditor } from "@/components/editor";
import Button from "@/components/toolBar/button";
import ToolBar from "@/components/toolBar/ToolBar";
import { importwpm1 } from "@/lib/missionIO/wm1/spec";
import { importwpm2, isValidMission } from "@/lib/missionIO/wm2/spec";
import { auth } from "@/util/auth";
import CloudWaypointProvider from "@/util/context/cloudWaypointProvider";
import MapProvider from "@/util/context/MapProvider";
import VehicleProvider from "@/util/context/VehicleTypeProvider";
import prisma from "@/util/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Mission({ params }: { params: Promise<{ missionid: string }> }) {
  const missionId = (await params).missionid

  // get the user data
  let userData = await auth.api.getSession({ headers: await headers() })
  const missionData = await prisma.mission.findUnique({ where: { id: missionId } })
  if (missionData == null) {
    return redirect("/")
  }

  // check if mission is public, redirect if user cannot access
  if (missionData.public === false && missionData.userId !== userData?.user.id) {
    return redirect("/")
  }

  // import the mission from the data
  const mission = importwpm2(missionData.data) || importwpm1(missionData.data)

  if (mission === undefined || !isValidMission(mission.mission)) {
    return (<div className="h-full w-full flex justify-center flex-col items-center">
      The mission is corrupt or possibly using an older version
      <Link href="/" className="no-underline text-black"><Button>Back</Button></Link>
    </div>)
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
