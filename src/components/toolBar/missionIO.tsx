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
          {!isStatic ? (
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

// grab the headers for session and forward to the client side
async function CloudSyncHeaders() {
  let data = await auth.api.getSession({ headers: await headers() })

  // don't show anything if user isn't logged in
  if (data === null) {
    return <div>Please sign in to use cloud syncing</div>
  }

  return <CloudSync data={data} />
}
