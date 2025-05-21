"use client"
import { useWaypoints } from "@/util/context/WaypointContext"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import WPCheckModal from "../modal/WPCheckModal"
import { DialogDescription } from "@radix-ui/react-dialog"
import { ReactNode } from "react"
import { wpCheck } from "@/lib/wpcheck/wpcheck"
import { Severity } from "@/lib/wpcheck/types"
import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react"
import { Button } from "../ui/button"

export default function WPCheck() {
  const { waypoints } = useWaypoints()
  const msg = wpCheck(waypoints.flatten("Main"), waypoints)
  const bad = msg.filter((x) => x.severity == Severity.Bad)

  let text: ReactNode = ""
  let color = ""
  if (bad.length == 0) {
    if (msg.length == 0) {
      color = "bg-green-200 border-green-300"
      text = <ShieldCheck className="" />
    } else {
      color = "bg-amber-200 border-amber-300"
      text = <ShieldAlert className="" />
    }
  } else {
    color = "bg-red-200 border-red-300"
    text = <ShieldX className="" />
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={color}>
          {text} < span className="grow"> Check</span>
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
