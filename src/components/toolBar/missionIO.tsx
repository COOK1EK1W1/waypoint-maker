import Button from "./button"
import MissionIOModal from "../modal/missionIOModal"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"

export default function MissionIO() {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-28">
          <span>Mission</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Import / Export Mission</DialogTitle>
        <MissionIOModal />
      </DialogContent>
    </Dialog>
  )

}
