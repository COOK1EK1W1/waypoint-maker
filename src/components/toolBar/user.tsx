import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardModal from "../modal/dashboard";
import { Suspense } from "react";
import SignOut from "./signOut";
import LoginModal from "../modal/login";
import { DialogDescription } from "@radix-ui/react-dialog";
import { auth } from "@/util/auth";
import { headers } from "next/headers";
import { Button } from "../ui/button";

export function UserSkeleton() {
  return <Button variant="active"><span className="h-6 rounded-full animate-pulse w-20 bg-muted" /></Button>
}

export default async function User() {
  let data = await auth.api.getSession({ headers: await headers() })

  return (< Dialog >
    <DialogTrigger asChild>
      {data?.user ?
        <Button variant="active"><img height={20} width={20} className="rounded-full" alt="profile picture" src={data.user.image || ""} /><span className="grow">Account</span></Button> :
        <Button variant="active">Sign In</Button>
      }
    </DialogTrigger>
    <DialogContent>
      {data?.user ? (
        <>
          <DialogTitle>My Account</DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                Logged in as:
                <span className="flex items-center gap-2 bg-muted px-2 py-1 rounded-md shadow-sm max-w-[210px]">
                  <img height={20} width={20} className="rounded-full" alt="profile picture" src={data.user.image || ""} />
                  <span className="truncate whitespace-nowrap overflow-hidden">{data.user.name}</span>
                </span>
              </div>
              <div className="ml-auto"><SignOut /></div>
            </div>
          </DialogDescription>
          <Suspense fallback={<p>loading</p>}>
            <DashboardModal />
          </Suspense>
        </>
      ) : (
        <>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>Sign in to enable cloud syncing</DialogDescription>
          <LoginModal />
        </>
      )}
    </DialogContent>
  </Dialog >
  )
}
