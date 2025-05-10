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

export async function changeMissionName(missionId: string, newName: string) {
  let data = await auth.api.getSession({ headers: await headers() })
  const userID = data?.user.id
  if (!userID) redirect("/")
  const res = await prisma.mission.update({
    where: {
      id: missionId,
      userId: userID
    },
    data: {
      title: newName
    }
  })
  return res
}

export async function changeMissionVisibility(missionId: string, isPublic: boolean) {
  let data = await auth.api.getSession({ headers: await headers() })
  const userID = data?.user.id
  if (!userID) redirect("/")
  const res = await prisma.mission.update({
    where: {
      id: missionId,
      userId: userID
    },
    data: {
      public: isPublic
    }
  })
  return res
}

export async function copyMission(missionId: string, newName: string) {
  let data = await auth.api.getSession({ headers: await headers() })
  const userID = data?.user.id
  if (!userID) redirect("/")
  const newData = await prisma.mission.findFirst({
    where: { id: missionId, userId: userID }
  })
  if (newData === null) redirect("/")
  const res = await prisma.mission.create({
    data: {
      title: newName,
      data: newData.data,
      userId: userID,
      public: false,
    }
  })
  return res
}
