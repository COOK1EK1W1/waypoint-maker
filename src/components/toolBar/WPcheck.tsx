"use client"
import { useWaypoints } from "@/util/context/WaypointContext"
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
  const WPCheckGen = wpCheck(waypoints.flatten("Main"), waypoints)

  const firstMessage = WPCheckGen.next()

  let text: ReactNode = ""
  let variant: "green" | "amber" | "red" = "green"
  if (firstMessage.done) {
      variant = "green"
    text = <ShieldCheck className="" />
  } else {
    if (firstMessage.value.severity == Severity.Bad) {
      variant = "red"
      text = <ShieldX className="" />
    } else {
      variant = "amber"
      text = <ShieldAlert className="" />
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant}>
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
