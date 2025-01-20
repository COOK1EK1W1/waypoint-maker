"use client"

import { useRouter } from "next/navigation"
import Button from "../toolBar/button"
import { newProj } from "./actions"

export default function CreateMission({ userId }: { userId: string }) {
  const router = useRouter()
  function handleCreate() {
    const title = prompt("Enter Mission Name")
    if (title && title != "") {
      newProj(userId, title).then((e) => {
        router.push(e.id)
      })
    }

  }
  return (
    <Button onClick={handleCreate} className="bg-white w-full justify-center p-2 my-3">Create Mission</Button>
  )

}
