import prisma from "@/util/prisma";
import { Session } from "next-auth";
import MissionTile from "../dashboard/mission";
import CreateMission from "../dashboard/createMission";

export default async function DashboardModal({ userData }: { userData: Session }) {
  //get mission from db

  if (!userData.user || !userData.user.email) {
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
        }
      }
    }
  })
  if (!user) {
    return <></>
  }


  return (<div>
    <div className="flex flex-col">
      <CreateMission userId={user.id} />
      {user?.missions.map((mission, i) => (
        <MissionTile mission={mission} key={i} userId={user.id} />
      ))}
    </div>

  </div>)
}
