"use server"

import prisma from "@/util/prisma"

export async function syncMission(id: string, data: string) {
  const res = await prisma.mission.update({ where: { id: id }, data: { data: data, modifiedAt: new Date() } })
  return res

}
