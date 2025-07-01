<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { CaretakerRelationGetMany } from '~/types'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')

const { data: session } = useAuth()

const { caretakerRelation } = useQuery()
const { data: patientsData, isLoading } = caretakerRelation.all({ where: { caretakerId: session.value?.user.id } })
const patients = computed(() => patientsData.value || [])

const { $trpc } = useNuxtApp()
const queryClient = useQueryClient()
const deleteRelation = useMutation({
  mutationFn: $trpc.caretakerRelation.delete.mutate,
  mutationKey: ['caretakerRelation', 'delete'],
  onSuccess: () => {
    useToastMessage('success', 'Patient removed successfully')
    queryClient.invalidateQueries({ queryKey: ['caretakerRelation', 'all'] })
  },
})

const columns: TableColumn<CaretakerRelationGetMany>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => row.original.patient.name,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.patient.email,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const color = row.original.isConfirmed ? 'success' : 'error'

      return h(UBadge, { class: 'capitalize select-none', variant: 'subtle', color }, () => row.original.isConfirmed ? 'Confirmed' : 'Unconfirmed')
    }
  },
  {
    id: 'actions',
    size: 10,
    maxSize: 10,
    cell: ({ row }) => {
      return h(
        'div',
        { width: 'fit' },
        h(UButton, {
          icon: 'ic:baseline-delete',
          color: 'error',
          variant: 'ghost',
          class: 'ml-auto',
          onClick: () => deleteRelation.mutateAsync({ id: row.original.id }),
        })
      )
    },
    meta: {
      class: {
        td: 'w-16 whitespace-normal',
      },
    },
  },
]
</script>

<template>
  <Card class="w-full">
    <template #header>
      <h1 class="text-center text-xl font-semibold">
        Patients
      </h1>
    </template>

    <div v-if="isLoading" class="flex items-center justify-center p-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mr-4" />
      <span class="ml-2 text-muted">Loading patients...</span>
    </div>

    <div v-if="!isLoading" class="p-4">
      <UTable :data="patients" :columns="columns" class="flex-1" />
    </div>
  </Card>
</template>
