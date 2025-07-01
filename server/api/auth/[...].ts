import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getPrisma } from '~/server/middleware/0.prisma'
import { NuxtAuthHandler } from '#auth'
import { authSchema } from '~/types/auth'
import 'next-auth'

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET || 'testSecret',
  pages: {
    signIn: '/login',
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {
        type: { label: 'Type', type: 'text' },
        name: { label: 'Name', type: 'text' },
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
      },
      authorize: async (credentials: any) => {
        const parsed = authSchema.parse(credentials)

        if (parsed.type === 'login') {
          // Handle login
          const { email, password } = parsed
          const user = await getPrisma().account.findUnique({
            where: { email },
            select: { id: true, password: true, role: true },
          })

          if (!user) {
            throw new Error('Invalid email or password')
          }

          const isPasswordValid = await bcrypt.compare(password, user.password)
          if (!isPasswordValid) {
            throw new Error('Invalid email or password')
          }

          return { id: user.id }
        }
        else {
          // Handle registration
          const { name, email, password, role } = parsed

          // Check if user already exists
          const existingUser = await getPrisma().account.findUnique({
            where: { email },
            select: { id: true },
          })

          if (existingUser) {
            throw new Error('An account with this email already exists')
          }

          // Create new user
          const hashedPassword = await bcrypt.hash(password, 10)
          const newUser = await getPrisma().account.create({
            data: { name, email, password: hashedPassword, role },
            select: { id: true },
          })

          return { id: newUser.id }
        }
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id || ''
      }
      return token
    },
    session: async ({ session, token }) => {
      try {
        const user = await getPrisma().account.findUniqueOrThrow({
          where: { id: z.string().parse(token.id) },
          select: {
            id: true,
            role: true,
            email: true,
            name: true,
          },
        })
        return {
          ...session,
          user
        }
      }
      catch (error) {
        console.error(error)
        throw error
      }
    },
  },
})
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      email: string
      name: string
    }
  }
}
