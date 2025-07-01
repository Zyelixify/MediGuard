<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'
import type { CaretakerRelationGetMany } from '~/types'

const UBadge = resolveComponent('UBadge')

const { data: session } = useAuth()

const { caretakerRelation } = useQuery()
const { data: patientsData } = caretakerRelation.all({
  where: { caretakerId: session.value?.user.id }
})
const patients = computed(() => patientsData.value || [])

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

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () => row.getValue('status'))
    }
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

    <div class="p-4">
      <UTable :data="patients" :columns="columns" class="flex-1" />
    </div>
  </Card>
</template>
