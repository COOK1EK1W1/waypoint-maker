import prisma from "@/util/prisma"
import { $Enums, Prisma } from "@prisma/client"
import { redirect } from "next/navigation"

export default function SignUp(){
  async function onSubmit(formdata: FormData){
    "use server"
    console.log(formdata)
    try{
      const res = await prisma.user.create({
        data: {
          name: formdata.get("name") as string,
          email: formdata.get("email") as string,
          password: formdata.get("password") as string,
          provider: $Enums.Provider.CRED
        }
      })
      console.log(res)
    }catch (error){
      if (error instanceof Prisma.PrismaClientKnownRequestError){

        if (error.code == "P2002"){
          console.log("email already taken")
          // TODO auto sign in
          redirect("/")
        }
      }
    }
    redirect("/")
  }

  return (
    <div>
      <h1>Sign Up</h1>
      <form action={onSubmit}>
        <label>
          Name:
          <input type="text" name="name" required />
        </label>
        <label>
          Email:
          <input type="text" name="email" required />
        </label>
        <label>
          Password:
          <input type="password" name="password" required />
        </label>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  )

}
