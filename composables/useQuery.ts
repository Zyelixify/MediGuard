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
    medication: {
      all: (queryArgs: MaybeRef<Prisma.MedicationFindManyArgs>) => useQuery({
        queryKey: ['medication', 'all', queryArgs],
        queryFn: () => $trpc.medication.findManyMedication.query(unref(queryArgs) ?? {}),
      }),
    },
    scheduledMedication: {
      all: (queryArgs: MaybeRef<Prisma.ScheduledMedicationFindManyArgs>) => useQuery({
        queryKey: ['scheduledMedication', 'all', queryArgs],
        queryFn: () => $trpc.scheduledMedication.findManyMedication.query(unref(queryArgs) ?? {}),
      }),
      nextDose: () => useQuery({
        queryKey: ['scheduledMedication', 'nextDose'],
        queryFn: () => $trpc.scheduledMedication.findNextDose.query(),
        refetchInterval: 60000, // Refetch every minute to keep data fresh
      }),
    },
    caretakerRelation: {
      all: (queryArgs: MaybeRef<Prisma.CaretakerRelationFindManyArgs>) => useQuery({
        queryKey: ['caretakerRelation', 'all', queryArgs],
        queryFn: () => $trpc.caretakerRelation.findManyCaretakerRelations.query(unref(queryArgs) ?? {}),
      }),
      byId: (id: MaybeRef<string | undefined | null>) => useQuery({
        queryKey: ['caretakerRelation', 'byId', id],
        queryFn: () => {
          const idValue = unref(id)
          if (!idValue) {
            return null
          }
          return $trpc.caretakerRelation.findOneCaretakerRelations.query({ id: idValue })
        }
      }),
    },
  }
}
