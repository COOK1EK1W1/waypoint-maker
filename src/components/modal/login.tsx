"use client"

import { signIn } from "next-auth/react"
import Button from "../toolBar/button"
import { useRouter } from "next/navigation"

export default function LoginModal() {
  const router = useRouter()
  return (
    <div className="flex flex-row w-full justify-around py-4">
      <Button onClick={() => signIn()} className="w-28">Sign In</Button>
      <Button onClick={() => router.push("/signup")} className="w-28">Sign Up</Button>
    </div>
  )
}
