"use client"

import { useRouter } from "next/navigation"
import Button from "../toolBar/button"
import { newProj } from "./actions"

export default function CreateMission({ userId }: { userId: string }) {
  const router = useRouter()
  return (
    <Button onClick={() => { newProj(userId).then(() => router.refresh()) }}>Create Mission</Button>
  )

}
