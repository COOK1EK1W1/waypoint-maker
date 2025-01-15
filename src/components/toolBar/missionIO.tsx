import Button from "./button"
import MissionIOModal from "@/components/modal/IO/missionIOModal"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
