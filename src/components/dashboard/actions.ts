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
