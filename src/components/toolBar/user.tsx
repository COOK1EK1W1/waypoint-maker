import { getServerSession } from "next-auth";
import Button from "./button";
import { FaUser } from "react-icons/fa";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardModal from "../modal/dashboard";
import { Suspense } from "react";
import SignOut from "./signOut";
import LoginModal from "../modal/login";

export default async function User() {
  const data = await getServerSession()

  console.log(data)
  return (< Dialog >
    <DialogTrigger asChild>
      {data?.user ? <Button className="w-28">{<FaUser />}{data.user?.name}</Button> : <Button className="w-28">Sign In</Button>}
    </DialogTrigger>
    <DialogContent>
      {data?.user ? (
        <>
          <DialogTitle>MyProjects</DialogTitle>
          <Suspense fallback={<p>loading</p>}>
            <SignOut />
            <DashboardModal userData={data} />
          </Suspense>
        </>
      ) : (
        <>
          <DialogTitle>Sign in</DialogTitle>
          <LoginModal />
        </>
      )}
    </DialogContent>
  </Dialog >
  )
}
