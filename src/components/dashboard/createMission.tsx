"use client"

import Button from "../toolBar/button"
import { newProj } from "./actions"

export default function CreateMission({ userId }: { userId: string }) {
  return (
    <Button onClick={() => { newProj(userId) }}>Create Mission</Button>

  )

}
