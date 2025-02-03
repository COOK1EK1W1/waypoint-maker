"use client"

import Button from "../toolBar/button"
import { useRouter } from "next/navigation"
import { authClient } from "@/util/auth-client"

export default function LoginModal() {
  const router = useRouter()
  const { signIn } = authClient
  return (
    <div className="flex flex-row w-full justify-around py-4">
      <Button onClick={() => signIn.social({ provider: "github" })} className="w-28">Sign In</Button>
      <Button onClick={() => router.push("/signup")} className="w-28">Sign Up</Button>
    </div>
  )
}
