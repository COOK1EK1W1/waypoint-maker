"use client"
import { useRouter } from "next/navigation";
import { FaTrash } from "react-icons/fa";
import Button from "../toolBar/button";
import { deleteMission } from "./actions";
import { useSession } from "next-auth/react";
import { timeAgo } from "@/util/time";
import { cn } from "@/lib/utils";
import { useWaypointContext } from "@/util/context/WaypointContext";

export default function MissionTile({ mission, userId }: { mission: { title: string, modifiedAt: Date, id: string }, userId: string }) {
  const { missionId } = useWaypointContext()
  const session = useSession()
  console.log(session)
  const router = useRouter()
  function handleDelete() {
    deleteMission(mission.id, userId).then(() => router.refresh())
  }

  return (
    <Button onClick={() => { router.push(`/m/${mission.id}`) }} className={cn("w-full px-2 bg-white p-2 m-2 flex-row", missionId == mission.id ? "bg-slate-200" : "")}>
      <div className="flex w-full flex-col items-start">
        <p>{mission.title}</p>

        <p className="text-slate-600">Last Modified: {timeAgo(mission.modifiedAt)}</p>
      </div>
      <div onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); handleDelete() }}>
        <FaTrash />
      </div>

    </Button>
  )

}
