import MissionIOModal from "@/components/modal/IO/missionIOModal"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DialogDescription } from "@radix-ui/react-dialog"
import Button from "./button"
import MissionIcon from "./missionButton"

export default function MissionIO() {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={"w-28 justify-start"}>
          <MissionIcon />
          <span className="grow">Mission</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Import / Export Mission</DialogTitle>
        <DialogDescription>Import or export a mission</DialogDescription>
        <MissionIOModal />
      </DialogContent>
    </Dialog>
  )

}
