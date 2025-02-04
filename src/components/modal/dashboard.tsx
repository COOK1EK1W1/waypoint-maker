import prisma from "@/util/prisma";
import MissionTile from "../dashboard/mission";
import CreateMission from "../dashboard/createMission";
import { auth } from "@/util/auth";
import { headers } from "next/headers";

export default async function DashboardModal() {
  let userData = await auth.api.getSession({ headers: await headers() })

  //get mission from db
  if (!userData?.user || !userData.user.email) {
    return <p>loading</p>
  }
  const user = await prisma.user.findFirst({
    where: {
      email: userData.user.email
    },
    include: {
      missions: {
        select: {
          title: true,
          modifiedAt: true,
          id: true
        },
        orderBy: {
          modifiedAt: "desc"
        }
      }
    },
  })
  if (!user) {
    return <></>
  }


  return (<div>
    <div className="flex flex-col max-h-[80dvh] overflow-auto">
      <CreateMission />
      {user?.missions.map((mission, i) => (
        <MissionTile mission={mission} key={i} />
      ))}
      {user?.missions.length == 0 ? <div className="w-full text-center py-10">No Saved Missions</div> : null}
    </div>

  </div>)
}
