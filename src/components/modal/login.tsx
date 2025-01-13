"use client"

import { signIn } from "next-auth/react"
import Button from "../toolBar/button"
import { useRouter } from "next/navigation"

export default function LoginModal() {
  const router = useRouter()
  return (    
    <div>
      <Button onClick={() => signIn()}>Sign In</Button>
      <Button onClick={() => router.push("signup")}>Sign Up</Button>
    </div>
  )
}
