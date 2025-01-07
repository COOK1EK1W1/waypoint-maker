import Button from "./button"
import OptimiseModal from "../modal/optimisation"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog"

export default function OptimiseButton({ className }: { className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={cn("w-28", className)}>
          <span>Opimise</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Optimise</DialogTitle>
        <OptimiseModal />
      </DialogContent>
    </Dialog>
  )

}
