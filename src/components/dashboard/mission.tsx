"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation";
import { changeMissionName, changeMissionVisibility, copyMission, deleteMission } from "./actions";
import { timeAgo } from "@/util/time";
import { useWaypoints } from "@/util/context/WaypointContext";
import { Copy, EllipsisVertical, Eye, Globe, Lock, Loader2, Pencil, Share, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";

export default function MissionTile({ mission }: { mission: { title: string, modifiedAt: Date, id: string, public: boolean } }) {
  const { missionId } = useWaypoints()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    const res = confirm("Are you sure?")
    if (!res) return

    startTransition(() => {
      deleteMission(mission.id).then((res) => {
        if (res.error !== null) {
          alert(res.error)
        }
        router.push("/")
      })
    })
  }

  function handleEditName() {
    const newName = prompt("Enter new Name")
    if (newName === null || newName === "") {
      alert("please enter a valid name")
      return
    }

    startTransition(() => {
      changeMissionName(mission.id, newName).then((res) => {
        if (res.error !== null) {
          alert(res.error)
          return
        }
        router.refresh()
      })
    })
  }

  function toggleVisibility() {
    startTransition(() => {
      changeMissionVisibility(mission.id, !mission.public).then((res) => {
        if (res.error !== null) {
          alert(res.error)
          return
        }
        router.refresh()
      })
    })
  }

  function handleCopy() {
    const newName = prompt("Enter new Name")
    if (newName === null || newName === "") {
      alert("please enter a valid name")
      return
    }

    startTransition(() => {
      copyMission(mission.id, newName).then((res) => {
        if (res.error !== null) {
          alert(res.error)
          return
        }
        router.push(`/m/${res.data.id}`)
      })
    })
  }

  async function handleShare() {
    await navigator.clipboard.writeText(`https://waypointmaker.app/m/${mission.id}`)
  }

  return (
    <Button variant={missionId == mission.id ? "active" : "default"} className={"w-full m-2 h-16 flex-row"}>
      <div onClick={() => { router.push(`/m/${mission.id}`) }} className="flex w-full flex-col items-start">
        <p className="font-medium">{mission.title}</p>

        <p className="text-sm text-muted-foreground flex items-center">
          {mission.public ?
            <Globe className="inline h-4 w-4 mr-2" /> :
            <Lock className="inline h-4 w-4 mr-2" />
          }
          Last Modified: {timeAgo(mission.modifiedAt)}
        </p>
      </div>
      <DropdownMenu>
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />)
          : (<DropdownMenuTrigger asChild>
            <div className="p-1 hover:bg-slate-100 rounded-full transition-colors" >
              <EllipsisVertical className="h-5 w-5 text-slate-500" />
            </div>
          </DropdownMenuTrigger>)}
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleEditName} className="gap-2">
            <Pencil className="h-4 w-4" />
            <span>Edit Name</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare} className="gap-2">
            <Share className="h-4 w-4" />
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopy} className="gap-2">
            <Copy className="h-4 w-4" />
            <span>Create Copy</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleVisibility} className="gap-2">
            <Eye className="h-4 w-4" />
            <span>Make {mission.public ? "Private" : "Public"}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-500 gap-2 focus:text-red-500">
            <Trash className="h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Button>
  )

}
