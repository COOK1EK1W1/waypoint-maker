import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { Provider } from "next-auth/providers/index";
import prisma from "./prisma";


export const providers: Provider[] = [

  GitHubProvider({
    clientId: process.env.GITHUB_ID as string,
    clientSecret: process.env.GITHUB_SECRET as string
  }),
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'text', placeholder: 'john.doe@example.com' },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials) {
      // Add logic here to look up the user from the credentials supplied
      console.log(credentials)
      const user = await prisma.user.findUnique({where: {
        email: credentials?.email,
        password: credentials?.password
      },
        select: {
          name: true, email: true, id: true
        }
      })
      return user
    }
  })
]

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  pages: {
    signIn: "/",
  },
})

export const options: NextAuthOptions = {
  providers: providers
}
