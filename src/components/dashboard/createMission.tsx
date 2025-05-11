"use client"

import { useRouter } from "next/navigation"
import Button from "../toolBar/button"
import { newProj } from "./actions"

export default function CreateMission() {
  const router = useRouter()

  function handleCreate() {
    const title = prompt("Enter Mission Name")
    if (title === null || title === "") {
      alert("Please use a valid name")
      return
    }
    newProj(title).then((res) => {
      if (res.error !== null) {
        alert(res.error)
        return
      }
      router.push("/m/" + res.data.id)
    })

  }
  return (
    <Button onClick={handleCreate} className="bg-white w-full justify-center p-2 my-3">Create New Mission</Button>
  )

}
