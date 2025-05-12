"use client"

import { authClient } from "@/util/auth-client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react";
import Button from "./button"

export default function SignOut() {
  const router = useRouter()
  const { signOut } = authClient

  return (
    <Button
      onClick={() => {signOut(); router.refresh()}}
      className="w-28 bg-white text-red-500 hover:bg-slate-100 flex items-center justify-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}
