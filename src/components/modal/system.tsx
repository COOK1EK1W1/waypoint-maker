import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import Link from "next/link"

export default function SystemModal() {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="items-center flex flex-row cursor-pointer">
          <Image width={46} height={32} className="h-9 px-2" src="/logo-192x192.png" alt="Waypoint Maker Logo" />
          <h1 className="mx-4 py-0 hidden lg:flex items-center">Waypoint Maker</h1>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-4xl">Waypoint Maker</DialogTitle>
        <div className="w-full flex flex-col items-center">
          <Image className="hover:animate-spin" width={192} height={192} src="/logo-192x192.png" alt="Waypoint Maker Logo" />
          <p className="text-muted-foreground">Waypoint Maker</p>
          <p className="text-muted-foreground">Version 2.0 - 2025</p>
          <div className="flex items-center pt-2">
            <Link className="text-muted-foreground" href="https://github.com/COOK1EK1W1/waypoint-maker">Source</Link>
            <div className="rounded-full mx-2 w-2 h-2 bg-slate-400"></div>
            <Link className="text-muted-foreground" href="https://github.com/COOK1EK1W1/waypoint-maker/issues">Report an issue</Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

}
