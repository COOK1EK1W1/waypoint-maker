import prisma from "@/util/prisma";
import { Session } from "next-auth";
import MissionTile from "../dashboard/mission";
import CreateMission from "../dashboard/createMission";

export default async function DashboardModal({ userData }: { userData: Session }) {
  //get projects from db



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
    Signed in as {userData.user?.name}
    <div className="flex flex-wrap">
      <CreateMission userId={user.id} />
      {user?.missions.map((mission, i) => (
        <MissionTile mission={mission} key={i} />
      ))}
    </div>

  </div>)
}
