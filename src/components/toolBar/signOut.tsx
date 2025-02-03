"use client"

import { authClient } from "@/util/auth-client"
import Button from "./button"

export default function SignOut() {
  const { signOut } = authClient
  return (<Button onClick={() => signOut()}>Sign Out</Button>)
}
