"use server"
import { auth } from "@/util/auth";
import prisma from "@/util/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function newProj(title: string) {
  let data = await auth.api.getSession({ headers: await headers() })
  const userID = data?.user.id
  if (!userID) redirect("/")
  const res = await prisma.mission.create({
    data: {
      title: title,
      data: `[["Main",[]],["Geofence",[]],["Markers",[]]]`,
      userId: userID,
      public: false,
    }
  })
  return res
}

export async function deleteMission(missionId: string) {
  let data = await auth.api.getSession({ headers: await headers() })
  const userID = data?.user.id
  if (!userID) redirect("/")
  const res = await prisma.mission.delete({
    where: { id: missionId, userId: userID }
  })
  return res
}
