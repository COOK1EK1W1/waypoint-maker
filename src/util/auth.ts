import NextAuth from "next-auth";
import GitHubProvider from 'next-auth/providers/github'
import { Provider } from "next-auth/providers/index";
import prisma from "./prisma";
import bcrypt from "bcrypt"
import Credentials from "next-auth/providers/credentials";


export const providers: Provider[] = [

  GitHubProvider({
    clientId: process.env.GITHUB_ID as string,
    clientSecret: process.env.GITHUB_SECRET as string
  }),
  Credentials({
    credentials: {
      email: { label: 'Email' },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials) {

      if (!credentials?.email || !credentials?.password) {
        throw new Error("Missing Email or password")
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      })
      if (!user) {
        throw new Error("No user with email")
      }

      if (!user.password) {
        throw new Error("Email taken by other provider")
      }

      const isValidPassword = bcrypt.compare(credentials.password, user.password)
      if (!isValidPassword) {
        throw new Error("Invalid Password")
      }
      return { id: user.id, name: user.name, email: user.email }
    }
  })
]
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: providers,
})
