import Button from "@/components/toolBar/button"
import prisma from "@/util/prisma"
import { $Enums, Prisma } from "@prisma/client"
import Image from "next/image"
import { redirect } from "next/navigation"

export default function SignUp() {
  async function onSubmit(formdata: FormData) {
    "use server"
    try {
      const res = await prisma.user.create({
        data: {
          name: formdata.get("name") as string,
          email: formdata.get("email") as string,
          password: formdata.get("password") as string,
          provider: $Enums.Provider.CRED
        }
      })
    } catch (error) {
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
