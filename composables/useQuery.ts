import { useQuery } from '@tanstack/vue-query'
import type { Prisma } from '@prisma/client'

export default () => {
  const { $trpc } = useNuxtApp()

  return {
    account: {
      all: (queryArgs: MaybeRef<Prisma.AccountFindManyArgs>) => useQuery({
        queryKey: ['account', 'all', queryArgs],
        queryFn: () => $trpc.account.findManyAccount.query({ queryArgs: unref(queryArgs) ?? {} }),
      }),
      byEmail: (email: MaybeRef<string | undefined | null>) => useQuery({
        queryKey: ['account', 'byEmail', email],
        queryFn: () => {
          const emailValue = unref(email)
          if (!emailValue) {
            return null
          }
          return $trpc.account.findOneAccount.query({ email: emailValue })
        },
      }),
    },
    event: {
      all: (queryArgs: MaybeRef<Prisma.EventFindManyArgs>) => useQuery({
        queryKey: ['event', 'all', queryArgs],
        queryFn: () => $trpc.event.findManyEvent.query(unref(queryArgs) ?? {}),
      }),
    },
  }
}
