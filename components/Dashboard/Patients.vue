<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'

const { data: session } = useAuth()

const { caretakerRelation } = useQuery()
const { data: patientsData, isLoading, refetch, isFetching } = caretakerRelation.all({
  where: { caretakerId: session.value?.user.id }
})
const patients = computed(() => patientsData.value || [])

// Track refresh loading state separately from initial loading
const isRefreshing = computed(() => isFetching.value && !isLoading.value)

const { $trpc } = useNuxtApp()
const queryClient = useQueryClient()

const deleteRelation = useMutation({
  mutationFn: $trpc.caretakerRelation.delete.mutate,
  mutationKey: ['caretakerRelation', 'delete'],
  onSuccess: () => {
    useToastMessage('success', 'Patient removed successfully')
    queryClient.invalidateQueries({ queryKey: ['caretakerRelation', 'all'] })
  },
  onError: (error) => {
    console.error('Failed to remove patient:', error)
    useToastMessage('error', 'Failed to remove patient')
  },
})

const confirmRelation = useMutation({
  mutationFn: $trpc.caretakerRelation.confirm.mutate,
  mutationKey: ['caretakerRelation', 'confirm'],
  onSuccess: () => {
    useToastMessage('success', 'Patient connection confirmed')
    queryClient.invalidateQueries({ queryKey: ['caretakerRelation', 'all'] })
  },
  onError: (error) => {
    console.error('Failed to confirm patient:', error)
    useToastMessage('error', 'Failed to confirm patient connection')
  },
})

// Handle patient removal with confirmation
async function handleRemovePatient(patient: any) {
  // eslint-disable-next-line no-alert
  const confirmed = window.confirm(`Are you sure you want to remove ${patient.patient.name} from your patients? This action cannot be undone.`)

  if (confirmed) {
    deleteRelation.mutate({ id: patient.id })
  }
}
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
        <UIcon name="ic:round-people" class="text-primary text-lg sm:text-xl flex-shrink-0" />
        <h2 class="text-base sm:text-xl font-semibold text-default">
          My Patients
        </h2>
        <UBadge v-if="patients.length > 0" variant="soft" color="primary" size="sm" class="sm:size-md">
          {{ patients.length }}
        </UBadge>
      </div>
    </template>

    <template #headerExtra>
      <div class="flex items-center gap-1 sm:gap-2">
        <UTooltip text="Refresh patient list">
          <UButton
            size="sm"
            variant="outline"
            color="neutral"
            icon="ic:round-refresh"
            :loading="isRefreshing"
            :disabled="isRefreshing || isLoading"
            class="hidden sm:flex"
            @click="refetch()"
          />
        </UTooltip>
      </div>
    </template>

    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
    </div>

    <div v-else-if="patients.length === 0" class="text-center py-8 space-y-3">
      <UIcon name="ic:round-people-outline" class="text-muted text-4xl mx-auto" />
      <div class="space-y-1">
        <p class="text-sm font-medium text-default">
          No patients connected
        </p>
        <p class="text-xs text-muted">
          Ask patients to share their QR code with you to connect
        </p>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="patient in patients"
        :key="patient.id"
        class="flex items-center justify-between p-4 bg-elevated rounded-lg shadow-sm border border-default hover:border-primary transition-colors"
      >
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <UIcon name="ic:round-person" class="text-primary text-lg" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-sm font-semibold text-default truncate">
                {{ patient.patient.name }}
              </h3>
              <UBadge
                :color="patient.isConfirmed ? 'success' : 'warning'"
                variant="soft"
                size="sm"
              >
                {{ patient.isConfirmed ? 'Connected' : 'Pending' }}
              </UBadge>
            </div>
            <p class="text-xs text-muted truncate">
              {{ patient.patient.email }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1 flex-shrink-0">
          <UTooltip v-if="!patient.isConfirmed" text="Confirm Connection">
            <UButton
              variant="ghost"
              color="success"
              icon="ic:round-check-circle"
              size="sm"
              :loading="confirmRelation.isPending.value"
              @click="confirmRelation.mutate({ id: patient.id })"
            />
          </UTooltip>

          <UTooltip text="Remove Patient">
            <UButton
              variant="ghost"
              color="error"
              icon="ic:round-delete"
              size="sm"
              :loading="deleteRelation.isPending.value"
              @click="() => handleRemovePatient(patient)"
            />
          </UTooltip>
        </div>
      </div>
    </div>
  </Card>
</template>
