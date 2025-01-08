import prisma from "@/util/prisma";
import { Session } from "next-auth";

export default async function DashboardModal({ userData }: { userData: Session }) {
  //get projects from db


  await new Promise(r => setTimeout(r, 2000));
  if (!userData.user || !userData.user.email) {
    return <p>loading</p>
  }
  const user = await prisma.user.findFirst({
    where: {
      email: userData.user.email
    },
    include: {
      missions: true
    }
  })

  return (<div>
    Signed in as {userData.user?.name}
    <div className="flex flex-wrap">
      <div> Create Project</div>
      {user?.missions.map((mission) => (
        <div className="border-2 border-slate-200 shadow-lg p-4 rounded-lg m-4">
          <p>{mission.title}</p>
        </div>

      ))}
    </div>
  </div>)
}
