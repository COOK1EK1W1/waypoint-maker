"use client"
import { useWaypoints } from "@/util/context/WaypointContext"
import { cn } from "@/lib/utils"
import { FaCheck } from "react-icons/fa"
import { FaX } from "react-icons/fa6"
import { MdErrorOutline } from "react-icons/md"
import { Severity } from "@/types/waypoints"
import { wpCheck } from "@/util/wpcheck"
import Button from "./button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import WPCheckModal from "../modal/WPCheckModal"
import { DialogDescription } from "@radix-ui/react-dialog"
import { ReactNode } from "react"

export default function WPCheck() {
  const { waypoints } = useWaypoints()
  const msg = wpCheck(waypoints.flatten("Main"), waypoints)
  const bad = msg.filter((x) => x.severity == Severity.Bad)

  let text: ReactNode = ""
  let color = ""
  if (bad.length == 0) {
    if (msg.length == 0) {
      color = "bg-green-200 border-green-300"
      text = <FaCheck />
    } else {
      color = "bg-amber-200 border-amber-300"
      text = <MdErrorOutline />
    }
  } else {
    color = "bg-red-200 border-red-300"
    text = <FaX />
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={cn(color, "w-28")}>
          {text} < span > WPCheck</span>
        </Button >
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Waypoint Check</DialogTitle>
        <DialogDescription>Check the validity of the mission</DialogDescription>
        <WPCheckModal />
      </DialogContent>
    </Dialog>
  )

}
