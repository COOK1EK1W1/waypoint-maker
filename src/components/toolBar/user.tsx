import Button from "./button";
import { FaUser } from "react-icons/fa";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardModal from "../modal/dashboard";
import { Suspense } from "react";
import SignOut from "./signOut";
import LoginModal from "../modal/login";
import { DialogDescription } from "@radix-ui/react-dialog";
import { auth } from "@/util/auth";
import { headers } from "next/headers";

export default async function User() {
  let data = await auth.api.getSession({ headers: await headers() })

  return (< Dialog >
    <DialogTrigger asChild>
      {data?.user ? <Button className="w-28">{<FaUser />}{data.user?.name}</Button> : <Button className="w-28">Sign In</Button>}
    </DialogTrigger>
    <DialogContent>
      {data?.user ? (
        <>
          <DialogTitle>My Projects</DialogTitle>
          <DialogDescription>
            You are logged in as {data.user.name}
          </DialogDescription>
          <Suspense fallback={<p>loading</p>}>
            <SignOut />
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
