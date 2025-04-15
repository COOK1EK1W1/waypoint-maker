"use server"

import { auth } from "@/util/auth"
import prisma from "@/util/prisma"
import { Result, tryCatch } from "@/util/try-catch"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function syncMission(id: string, data: string): Promise<Result<boolean, string>> {

  let userData = await tryCatch(auth.api.getSession({ headers: await headers() }))
  if (userData.error !== null) {
    return { error: "Could not authenticate", data: null }
  }

  const userID = userData.data?.user.id
  if (!userID) {
    return { error: "User not authenticated", data: null }
  }

  const res = await tryCatch(prisma.mission.update({
    where: { id: id, userId: userID },
    data: { data: data, modifiedAt: new Date() }
  }))
  if (res.error !== null) {
    return { error: "Could not update mission", data: null }
  }

  return { data: true, error: null }
}

export async function createNewMission(title: string, data: string): Promise<Result<boolean, string>> {

  let userData = await tryCatch(auth.api.getSession({ headers: await headers() }))
  if (userData.error !== null) {
    return { error: "Could not authenticate", data: null }
  }

  const userID = userData.data?.user.id
  if (!userID) {
    return { error: "User not authenticated", data: null }
  }

  const newMission = await tryCatch(prisma.mission.create({
    data: {
      title: title,
      data: data,
      public: false,
      userId: userID
    }
  }))
  if (newMission.error !== null) {
    return { error: "Could not create new mission", data: null }
  }

  redirect(`/m/${newMission.data.id}`)
}
