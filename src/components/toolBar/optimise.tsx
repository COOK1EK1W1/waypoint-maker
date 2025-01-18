"use client"
import Button from "./button"
import { useWaypointContext } from "../../util/context/WaypointContext"
import OptimiseModal from "../modal/optimisation"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"
import { get_waypoints } from "@/util/WPCollection"
import { DialogDescription } from "@radix-ui/react-dialog"

export default function OptimiseButton() {
  const { waypoints } = useWaypointContext()

  let wps = get_waypoints("Main", waypoints)

  //find if the current waypoints contain a dubinds type
  const hasDubins = wps.map((wp) => wp.type).includes(69)
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={cn("w-28", hasDubins ? "w-28" : "w-0 p-0 m-0 border-0", "overflow-hidden")}>
          <span>Opimise</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Optimise</DialogTitle>
        <DialogDescription>Optimise the Dubins waypoints</DialogDescription>
        <OptimiseModal />
      </DialogContent>
    </Dialog>
  )

}
