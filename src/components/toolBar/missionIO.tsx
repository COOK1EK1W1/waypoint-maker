import { useState } from "react"
import Button from "./button"
import MissionIOModal from "../modal/missionIOModal"

export default function MissionIO() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex items-center">
      <MissionIOModal open={showModal} handleClose={() => setShowModal(false)} />
      <Button onClick={() => { setShowModal(true) }} className="w-28">
        <span>Mission</span>
      </Button>
    </div>
  )

}
