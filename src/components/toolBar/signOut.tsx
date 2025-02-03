"use client"

import { signOut } from "next-auth/react"
import Button from "./button"

export default function SignOut() {
  return (<Button onClick={() => signOut()}>Sign Out</Button>)
}
