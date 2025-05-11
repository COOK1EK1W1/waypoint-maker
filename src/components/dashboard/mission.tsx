"use client"
import { useRouter } from "next/navigation";
import Button from "../toolBar/button";
import { changeMissionName, changeMissionVisibility, copyMission, deleteMission } from "./actions";
import { timeAgo } from "@/util/time";
import { cn } from "@/lib/utils";
import { useWaypoints } from "@/util/context/WaypointContext";
import { Copy, EllipsisVertical, Eye, Globe, Lock, Pencil, Share, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

export default function MissionTile({ mission }: { mission: { title: string, modifiedAt: Date, id: string, public: boolean } }) {
  const { missionId } = useWaypoints()
  const router = useRouter()

  function handleDelete() {
    const res = confirm("Are you sure?")
    if (!res) return

    deleteMission(mission.id).then((res) => {
      if (res.error !== null) {
        alert(res.error)
      }
      router.push("/")
    })

  }

  function handleEditName() {
    const newName = prompt("Enter new Name")
    if (newName === null || newName === "") {
      alert("please enter a valid name")
      return
    }

    changeMissionName(mission.id, newName).then((res) => {
      if (res.error !== null) {
        alert(res.error)
        return
      }
      router.refresh()
    })
  }

  function toggleVisibility() {
    changeMissionVisibility(mission.id, !mission.public).then((res) => {
      if (res.error !== null) {
        alert(res.error)
        return
      }
      router.refresh()
    })
  }

  function handleCopy() {
    const newName = prompt("Enter new Name")
    if (newName === null || newName === "") {
      alert("please enter a valid name")
      return
    }

    copyMission(mission.id, newName).then((res) => {
      if (res.error !== null) {
        alert(res.error)
        return
      }
      router.push(`/m/${res.data.id}`)
    })
  }

  async function handleShare() {
    await navigator.clipboard.writeText(`https://waypointmaker.app/m/${mission.id}`)
  }

  return (
    <Button className={cn("w-full px-2 bg-white p-2 m-2 flex-row", missionId == mission.id ? "bg-slate-100" : "")}>
      <div onClick={() => { router.push(`/m/${mission.id}`) }} className="flex w-full flex-col items-start">
        <p>{mission.title}</p>

        <p className="text-muted-foreground align-center">
          {mission.public ? <Globe className="inline h-5 w-5 mr-2" /> : <Lock className="inline h-5 w-5 mr-2" />}
          Last Modified: {timeAgo(mission.modifiedAt)}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div>
            <EllipsisVertical />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent >
          <DropdownMenuItem onClick={handleEditName}>
            <Pencil />
            <span>Edit Name</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShare}>
            <Share />
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopy}>
            <Copy />
            <span>Create Copy</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleVisibility}>
            <Eye />
            <span>Make {mission.public ? "Private" : "Public"}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-500">
            <Trash />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </Button>
  )

}
