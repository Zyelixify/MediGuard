import CredentialsProvider from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getPrisma } from '~/server/middleware/0.prisma'
import { NuxtAuthHandler } from '#auth'
import 'next-auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  role: z.enum(['user', 'caretaker']).default('user'),
})
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
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials: any) => {
        const { email, password, role } = loginSchema.parse(credentials)
        let user = await getPrisma().account.findUnique({
          where: { email },
          select: { id: true, password: true, role: true },
        })

        if (!user) {
          const hashedPassword = await bcrypt.hash(password, 10)
          user = await getPrisma().account.create({
            data: { email, password: hashedPassword, role },
            select: { id: true, password: true, role: true },
          })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (isPasswordValid) {
          if (user.role !== role) {
            throw new Error('Role mismatch. Please ensure you are logging as the correct role.')
          }

          return { id: user.id }
        }
        return null
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
