<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { h, resolveComponent } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { CaretakerRelationGetMany } from '~/types'
import MedicationCreationModal from '~/components/Medication/CreationModal.vue'

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
  onSuccess: async () => {
    useToastMessage('success', 'Patient removed successfully')
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['caretakerRelation', 'all'] }),
      queryClient.invalidateQueries({ queryKey: ['event'] })
    ])
  },
  onError: (error) => {
    console.error('Failed to remove patient:', error)
    useToastMessage('error', 'Failed to remove patient')
  },
})

function handleDeletePatient(patient: any) {
  // eslint-disable-next-line no-alert
  const confirmed = window.confirm(`Are you sure you want to remove ${patient.patient.name} from your patients? This action cannot be undone.`)

  if (confirmed) {
    deleteRelation.mutate({ id: patient.id })
  }
}

const patientId = ref<string>('')
const patientName = ref<string>('')

const overlay = useOverlay()
const medicationCreationModal = overlay.create(MedicationCreationModal)

function openMedicationCreationModal(patient: CaretakerRelationGetMany['patient']) {
  patientId.value = patient.id
  patientName.value = patient.name ?? 'Unknown Patient'

  medicationCreationModal.open({ patientId: patientId.value, patientName: patientName.value })
}

// Controlled expansion state
const expanded = ref<Record<string, boolean>>({})

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
      const color = row.original.isConfirmed ? 'success' : 'warning'
      const text = row.original.isConfirmed ? 'Connected' : 'Pending'

      return h(UBadge, { class: 'capitalize select-none', variant: 'soft', color }, () => text)
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'flex items-center gap-1' },
        [
          h(UButton, {
            'v-if': row.original.isConfirmed,
            'color': 'neutral',
            'variant': 'ghost',
            'square': true,
            'size': 'sm',
            'aria-label': 'Expand',
            'icon': 'ic:round-chevron-right',
            'ui': {
              leadingIcon: [
                'transition-transform duration-200',
                row.getIsExpanded() ? 'rotate-90' : ''
              ]
            },
            'label': row.getIsExpanded() ? 'Hide Medications' : 'View Medications',
            'onClick': () => row.toggleExpanded()
          }),
          h(UButton, {
            icon: 'ic:round-medication',
            color: 'primary',
            variant: 'ghost',
            size: 'md',
            label: 'Add Medication',
            onClick: () => openMedicationCreationModal(row.original.patient),
          }),
          h(UButton, {
            icon: 'ic:baseline-delete',
            color: 'error',
            variant: 'ghost',
            size: 'md',
            label: 'Delete',
            onClick: () => handleDeletePatient(row.original),
          })
        ]
      )
    },
    meta: {
      class: {
        td: 'w-32 whitespace-normal',
      },
    },
  },
]
</script>

<template>
  <Card class="w-full">
    <ClientOnly>
      <div v-if="isLoading" class="flex items-center justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
        <span class="ml-3 text-muted">Loading patients...</span>
      </div>

      <div v-else-if="patients.length === 0" class="flex flex-col items-center justify-center p-8 space-y-4">
        <UIcon name="ic:round-people-outline" class="text-muted text-4xl mx-auto" />
        <div class="space-y-1 text-center">
          <p class="text-sm font-medium text-default">
            No patients connected
          </p>
          <p class="text-xs text-muted">
            Patients need to share their QR code with you to connect
          </p>
        </div>
      </div>

      <div v-else class="w-full">
        <UTable
          v-model:expanded="expanded"
          :data="patients"
          :columns="columns"
          :ui="{
            tr: 'data-[expanded=true]:bg-elevated/50',
            base: 'table-fixed w-full overflow-x-scroll custom-scrollbar',
          }"
          class="flex-1"
        >
          <template #expanded="{ row }">
            <div class="bg-elevated/25 border-t border-gray-200 dark:border-gray-700">
              <div class="overflow-x-auto">
                <PatientMedicationExpansion :patient="row.original.patient" />
              </div>
            </div>
          </template>
        </UTable>
      </div>
    </ClientOnly>
  </Card>
</template>
