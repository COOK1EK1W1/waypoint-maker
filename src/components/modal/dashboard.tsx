import prisma from "@/util/prisma";
import MissionTile from "../dashboard/mission";
import CreateMission from "../dashboard/createMission";
import { auth } from "@/util/auth";
import { headers } from "next/headers";
import { ScrollArea } from "../ui/scroll-area";

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
          id: true,
          public: true
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
    <CreateMission />
    <ScrollArea className="max-h-[70dvh] h-[70dvh]">
      <div className="p-2">
        {user?.missions.map((mission, i) => (
          <MissionTile mission={mission} key={i} />
        ))}
        {user?.missions.length == 0 ? <div className="w-full text-center py-10">No Saved Missions</div> : null}
      </div>
    </ScrollArea>

  </div >)
}
