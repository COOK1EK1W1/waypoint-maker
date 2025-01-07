import { get_waypoints } from "@/util/WPCollection"
import { useWaypointContext } from "@/util/context/WaypointContext"
import { cn } from "@/util/tw"
import { FaCheck } from "react-icons/fa"
import { FaX } from "react-icons/fa6"
import { MdErrorOutline } from "react-icons/md"
import WPCheckModal from "./WPCheckModal"
import { useState } from "react"
import { Severity } from "@/types/waypoints"
import { wpCheck } from "@/util/wpcheck"
import Button from "./button"

export default function WPCheck() {
  const { waypoints } = useWaypointContext()
  const [showModal, setShowModal] = useState(false)
  const msg = wpCheck(get_waypoints("Main", waypoints), waypoints)
  const bad = msg.filter((x) => x.severity == Severity.Bad)

  let text: any = ""
  let color = ""
  if (bad.length == 0) {
    if (msg.length == 0) {
      color = "bg-green-200 border-green-200"
      text = <FaCheck />
    } else {
      color = "bg-amber-200 border-amber-200"
      text = <MdErrorOutline />
    }
  } else {
    color = "bg-red-200 border-red-200"
    text = <FaX />
  }

  return (
    <div className="flex items-center">
      <WPCheckModal open={showModal} close={() => setShowModal(false)} />
      <Button className={cn(color)} onClick={() => { setShowModal(true) }}>
        {text} < span > WPCheck</span>
      </Button >
    </div >
  )

}
