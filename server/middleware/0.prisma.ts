import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

export function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}
export type ExtendedPrismaClient = ReturnType<typeof getPrisma>
declare module 'h3' {
  interface H3EventContext {
    prisma: PrismaClient
  }
}

export default eventHandler((event) => {
  event.context.prisma = getPrisma()
})
