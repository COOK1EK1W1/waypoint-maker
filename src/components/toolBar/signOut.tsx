"use client"

import { authClient } from "@/util/auth-client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";

export default function SignOut() {
  const router = useRouter()
  const { signOut } = authClient

  return (
    <Button
      variant="destructive"
      onClick={() => {
        signOut().then(() => {
          router.refresh()
        })
      }}
      className="w-28 text-red-500  flex items-center justify-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}
