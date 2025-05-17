"use server"
import { auth } from "@/util/auth";
import prisma from "@/util/prisma";
import { Result, tryCatch } from "@/util/try-catch";
import { Mission } from "@prisma/client";
import { headers } from "next/headers";

async function checkUserMissionLimit(userID: string): Promise<Result<boolean, string>> {
  const missionLimitRaw = process.env.MAX_MISSIONS_PER_USER
  const missionLimit = parseInt(missionLimitRaw ?? "")

  if (!Number.isFinite(missionLimit) || missionLimit <= 0) 
    return { data: true, error: null }

  const userMissionCount = await tryCatch<number>(
    prisma.mission.count({ where: { userId: userID } })
  )

  if (userMissionCount.error !== null) 
    return { data: null, error: "Failed to check mission count for user" }

  if (userMissionCount.data >= missionLimit) 
    return { data: null, error: `Max number of missions for user has been reached (limit of ${missionLimit})` }
  
  return { data: true, error: null }
}


export async function newProj(title: string): Promise<Result<Mission, string>> {
  const userData = await tryCatch(auth.api.getSession({ headers: await headers() }))
  if (userData.error !== null) {
    return { error: "Could not authenticate", data: null }
  }

  const userID = userData.data?.user.id
  if (!userID) {
    return { error: "User not authenticated", data: null }
  }

  const missionLimitResult = await checkUserMissionLimit(userID)
  if (missionLimitResult.error !== null) return missionLimitResult

  const res = await tryCatch(prisma.mission.create({
    data: {
      title: title,
      data: `[["Main",[]],["Geofence",[]],["Markers",[]]]`,
      userId: userID,
      public: false,
    }
  }))

  if (res.error !== null) {
    return { error: "Could not create mission", data: null }
  }

  return { data: res.data, error: null }
}

export async function deleteMission(missionId: string): Promise<Result<Mission, string>> {
  const userData = await tryCatch(auth.api.getSession({ headers: await headers() }))
  if (userData.error !== null) {
    return { error: "Could not authenticate", data: null }
  }

  const userID = userData.data?.user.id
  if (!userID) {
    return { error: "User not authenticated", data: null }
  }

  const res = await tryCatch(prisma.mission.delete({
    where: { id: missionId, userId: userID }
  }))

  if (res.error !== null) {
    return { error: "Could not delete mission", data: null }
  }

  return res
}

export async function changeMissionName(missionId: string, newName: string): Promise<Result<Mission, string>> {
  const userData = await tryCatch(auth.api.getSession({ headers: await headers() }))
  if (userData.error !== null) {
    return { error: "Could not authenticate", data: null }
  }

  const userID = userData.data?.user.id
  if (!userID) {
    return { error: "User not authenticated", data: null }
  }

  const res = await tryCatch(prisma.mission.update({
    where: {
      id: missionId,
      userId: userID
    },
    data: {
      title: newName
    }
  }))

  if (res.error !== null) {
    return { error: "Could not update mission", data: null }
  }

  return res
}

export async function changeMissionVisibility(missionId: string, isPublic: boolean): Promise<Result<Mission, string>> {
  const userData = await tryCatch(auth.api.getSession({ headers: await headers() }))
  if (userData.error !== null) {
    return { error: "Could not authenticate", data: null }
  }

  const userID = userData.data?.user.id
  if (!userID) {
    return { error: "User not authenticated", data: null }
  }

  const res = await tryCatch(prisma.mission.update({
    where: {
      id: missionId,
      userId: userID
    },
    data: {
      public: isPublic
    }
  }))

  if (res.error !== null) {
    return { error: "Could not modify visibility", data: null }
  }

  return res
}

export async function copyMission(missionId: string, newName: string): Promise<Result<Mission, string>> {
  const userData = await tryCatch(auth.api.getSession({ headers: await headers() }))
  if (userData.error !== null) {
    return { error: "Could not authenticate", data: null }
  }

  const userID = userData.data?.user.id
  if (!userID) {
    return { error: "User not authenticated", data: null }
  }

  const newData = await tryCatch<Mission | null>(prisma.mission.findFirst({
    where: { id: missionId, userId: userID }
  }))
  if (newData.error !== null || newData.data === null) {
    return { error: "Could not find mission", data: null }
  }

  const missionLimitResult = await checkUserMissionLimit(userID)
  if (missionLimitResult.error !== null)  return missionLimitResult

  const res = await tryCatch(prisma.mission.create({
    data: {
      title: newName,
      data: newData.data.data,
      userId: userID,
      public: false,
    }
  }))

  if (res.error !== null) {
    return { error: "Could not create new mission", data: null }
  }

  return res
}
