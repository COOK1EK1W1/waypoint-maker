"use server"

import { auth } from "@/util/auth"
import prisma from "@/util/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function syncMission(id: string, data: string) {
  let userData = await auth.api.getSession({ headers: await headers() })
  const userID = userData?.user.id
  if (!userID) return
  await prisma.mission.update({ where: { id: id, userId: userID }, data: { data: data, modifiedAt: new Date() } })
}

export async function createNewMission(title: string, data: string) {
  let userData = await auth.api.getSession({ headers: await headers() })
  const userID = userData?.user.id
  if (!userID) return

  const newMission = await prisma.mission.create({
    data: {
      title: title,
      data: data,
      public: false,
      userId: userID
    }
  })

  redirect(`/m/${newMission.id}`)
}
