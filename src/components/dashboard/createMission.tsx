"use client"

import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useTransition } from "react"
import { newProj } from "./actions"
import { Button } from "../ui/button"

export default function CreateMission() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleCreate() {
    const title = prompt("Enter Mission Name")
    if (title === null || title === "") {
      alert("Please use a valid name")
      return
    }

    startTransition(() => {
      newProj(title).then((res) => {
        if (res.error !== null) {
          alert(res.error)
          return
        }
        router.push("/m/" + res.data.id)
      })
    })
  }
  return (
    <Button onClick={handleCreate} className="w-full h-12" disabled={isPending}>
      {isPending ? (
        <Loader2 className="animate-spin h-5 w-5 text-gray-700" />
      ) : (
        "Create New Mission"
      )}
    </Button>
  )

}
