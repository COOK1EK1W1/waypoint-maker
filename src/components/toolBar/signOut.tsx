"use client"

import { authClient } from "@/util/auth-client"
import Button from "./button"
import { useRouter } from "next/navigation"

export default function SignOut() {
  const router = useRouter()
  const { signOut } = authClient
  return (<Button onClick={() => { signOut(); router.refresh() }
  }> Sign Out</Button >)
}
