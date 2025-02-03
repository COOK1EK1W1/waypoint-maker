import Button from "@/components/toolBar/button"
import prisma from "@/util/prisma"
import { $Enums, Prisma } from "@prisma/client"
import Image from "next/image"
import { redirect } from "next/navigation"
import bcrypt from "bcrypt"
import { signIn } from "@/util/auth"

export default function SignUp() {
  async function onSubmit(formdata: FormData) {
    "use server"
    try {
      const name = formdata.get("name") as string
      const email = formdata.get("email") as string
      const password = formdata.get("password") as string

      const hashedPassword = await bcrypt.hash(password, 10)

      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          provider: $Enums.Provider.CRED
        }
      })

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password
      })
      console.log(result, "h")

      if (result?.ok) {
        redirect("/")
      } else {
        console.log("error", result?.error)
      }

    } catch (error) {
      console.error(error)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {

        if (error.code == "P2002") {
          console.log("email already taken")
          // TODO auto sign in
          redirect("/")
        }
      }
    }
    redirect("/")
  }

  return (
    <div className="h-[100dvh] flex justify-center items-center">
      <div className="w-96 m-2 p-2 border-2 border-slate-200 rounded-lg shadow-lg flex flex-col items-center">
        <Image src="/logo-192x192.png" height={192} width={192} alt="bruh" />
        <h1>Sign Up</h1>
        <form action={onSubmit} className="flex flex-col items-center">
          <label>
            <div>Name:</div>
            <input type="text" name="name" required />
          </label>
          <label>
            <div>Email:</div>
            <input type="text" name="email" required />
          </label>
          <label>
            <div>Password:</div>
            <input type="password" name="password" required />
          </label>

          <Button type="submit">Sign Up</Button>
        </form>
      </div>
    </div>
  )

}
