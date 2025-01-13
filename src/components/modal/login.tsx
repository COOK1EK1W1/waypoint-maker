"use client"
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef } from "react"

export default function LoginModal() {
  
  const router = useRouter()
  const username = useRef<null|HTMLInputElement>(null);
  const password = useRef<null|HTMLInputElement>(null);

  async function onSubmit(){
    if (username.current == null || password.current == null){
      return
    }

    const result = await signIn("credentials", {
      email: username.current.value,
      password: password.current.value,
      redirect: false,
      callbackUrl: "/"
    })
    if (result?.ok){
      router.refresh()
    }else{
      alert("login Failed")

    }


  }
  return (    
    <div>
      <input ref={username} placeholder="Username" type="text" />
      <input  ref={password} placeholder="Password" type="password"/>

      <button type="submit" onMouseDown={onSubmit}>Sign in</button>
    </div>
  )

}
