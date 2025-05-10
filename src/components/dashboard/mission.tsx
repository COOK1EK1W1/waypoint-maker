"use client"
import { useRouter } from "next/navigation";
import Button from "../toolBar/button";
import { deleteMission } from "./actions";
import { timeAgo } from "@/util/time";
import { cn } from "@/lib/utils";
import { useWaypoints } from "@/util/context/WaypointContext";
import { Copy, EllipsisVertical, Eye, Pencil, Share, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

export default function MissionTile({ mission }: { mission: { title: string, modifiedAt: Date, id: string } }) {
  const { missionId } = useWaypoints()
  const router = useRouter()
  function handleDelete() {
    deleteMission(mission.id).then(() => router.push("/"))
  }

  return (
    <Button className={cn("w-full px-2 bg-white p-2 m-2 flex-row", missionId == mission.id ? "bg-slate-100" : "")}>
      <div onClick={() => { router.push(`/m/${mission.id}`) }} className="flex w-full flex-col items-start">
        <p>{mission.title}</p>

        <p className="text-muted-foreground">Last Modified: {timeAgo(mission.modifiedAt)}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div>
            <EllipsisVertical />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent >
          <DropdownMenuItem>
            <Pencil />
            <span>Edit Name</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Share />
            <span>Share</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy />
            <span>Copy</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Eye />
            <span>Make Public</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete}>
            <Trash />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </Button>
  )

}
