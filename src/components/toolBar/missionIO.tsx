import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DialogDescription } from "@radix-ui/react-dialog"
import Button from "./button"
import MissionIcon from "./missionButton"
import DownloadButtons from "../modal/IO/exportButtons"
import LoadJson from "../modal/IO/importButtons"
import CloudSync from "../modal/IO/cloudSync"
import { Suspense } from "react"
import { auth } from "@/util/auth"
import { headers } from "next/headers"

export default function MissionIO({ isStatic }: { isStatic: boolean }) {
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
        <div>
          <h2>Export</h2>
          <DownloadButtons />
          <h2>Import</h2>
          <LoadJson />
          {process.env.ALLOWLOGIN && !isStatic ? (
            <Suspense fallback={<div>loading</div>}>
              <h2>Cloud Sync</h2>
              <CloudSyncHeaders />
            </Suspense>) : null
          }
        </div>
      </DialogContent>
    </Dialog>
  )

}
async function CloudSyncHeaders() {
  let data = await auth.api.getSession({ headers: await headers() })
  return <CloudSync data={data} />
}
