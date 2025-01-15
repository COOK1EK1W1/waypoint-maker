"use server"
import prisma from "@/util/prisma";

export async function newProj(userId: string) {
  const res = await prisma.mission.create({
    data: {
      title: "New Mission",
      data: `[["Main",[]],["Geofence",[]],["Markers",[]]]`,
      userId: userId
    }
  })
  return res
}

export async function deleteMission(missionId: string, userId: string) {
  const res = await prisma.mission.delete({
    where: { id: missionId, userId: userId }
  })
  return res
}
