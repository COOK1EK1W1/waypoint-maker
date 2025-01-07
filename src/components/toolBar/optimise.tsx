import { useState } from "react"
import Button from "./button"
import OptimiseModal from "../modal/optimisation"

export default function OptimiseButton() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex items-center">
      <OptimiseModal open={showModal} handleClose={() => setShowModal(false)} />
      <Button onClick={() => { setShowModal(true) }} className="w-28">
        <span>Opimise</span>
      </Button>
    </div>
  )

}
