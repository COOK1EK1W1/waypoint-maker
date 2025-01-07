import type { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'

export const options: NextAuthOptions = {
  providers: [
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
        const user = { id: "42", email: "ciarancook1@gmail.com", password: "password" }
        await new Promise(r => setTimeout(r, 2000));

        if (credentials?.email === user.email && credentials?.password === user.password) {
          return user
        } else {
          return null
        }
      }
    })
  ]
}
