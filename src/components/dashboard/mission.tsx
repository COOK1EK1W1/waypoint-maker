"use client"
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";
import Button from "../toolBar/button";
import { deleteMission } from "./actions";
import { useSession } from "next-auth/react";

export default function MissionTile({ mission, userId }: { mission: { title: string, modifiedAt: Date, id: string }, userId: string }) {
  const session = useSession()
  console.log(session)
  const router = useRouter()
  function handleDelete() {
    deleteMission(mission.id, userId).then(() => router.refresh())
  }

  return (
    <Button onClick={() => { router.push(`/m/${mission.id}`) }} className="w-full justify-between px-2">
      <p>{mission.title}</p>
      <div onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); handleDelete() }}>
        <FaTrash />
      </div>

    </Button>
  )

}
