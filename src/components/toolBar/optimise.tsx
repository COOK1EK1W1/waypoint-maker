import { useState } from "react"
import Button from "./button"
import OptimiseModal from "../modal/optimisation"
import { cn } from "@/util/tw"

export default function OptimiseButton({ className }: { className?: string }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex items-center">
      <OptimiseModal open={showModal} handleClose={() => setShowModal(false)} />
      <Button onClick={() => { setShowModal(true) }} className={cn("w-28", className)}>
        <span>Opimise</span>
      </Button>
    </div>
  )

}
