<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MedicationGetMany } from '~/types'

defineProps<{ medications: MedicationGetMany[] }>()

const { $trpc } = useNuxtApp()
const queryClient = useQueryClient()

const markAsTaken = useMutation({
  mutationFn: $trpc.scheduledMedication.updateTaken.mutate,
  mutationKey: ['scheduledMedication', 'updateTaken'],
  onSuccess: () => {
    useToastMessage('success', 'Medication marked as taken')
    queryClient.invalidateQueries({ queryKey: ['scheduledMedication'] })
    queryClient.invalidateQueries({ queryKey: ['medication'] })
  },
  onError: (error) => {
    console.error('Failed to mark medication as taken:', error)
    useToastMessage('error', 'Failed to mark medication as taken')
  },
})

function handleMarkAsTaken(medicationId: string) {
  markAsTaken.mutate({ id: medicationId, taken: true })
}

function formatFrequency(frequency: string): string {
  return frequency.toLowerCase().replace(/^\w/, c => c.toUpperCase())
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}
</script>

<template>
  <div class="w-full">
    <div v-if="medications.length === 0" class="flex flex-col items-center justify-center p-8 space-y-4">
      <UIcon name="ic:round-medication" class="text-muted text-4xl" />
      <div class="space-y-1 text-center">
        <p class="text-sm font-medium text-default">
          No medications found
        </p>
        <p class="text-xs text-muted">
          Add medications to see them here
        </p>
      </div>
    </div>

    <div v-else class="relative">
      <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <div
          v-for="medication in medications"
          :key="medication.id"
          class="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <UIcon name="ic:round-medication" class="text-primary text-lg" />
              <h3 class="font-semibold text-default truncate">
                {{ medication.name }}
              </h3>
            </div>
            <UBadge
              :color="medication.scheduledMedications?.some(sm => !sm.taken) ? 'warning' : 'success'"
              variant="soft"
              size="sm"
            >
              {{ medication.scheduledMedications?.some(sm => !sm.taken) ? 'Pending' : 'Complete' }}
            </UBadge>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex items-center gap-2">
              <UIcon name="ic:round-scale" class="text-muted text-sm" />
              <span class="text-sm text-default">{{ medication.dosage }}</span>
            </div>

            <div class="flex items-center gap-2">
              <UIcon name="ic:round-schedule" class="text-muted text-sm" />
              <span class="text-sm text-default">{{ formatFrequency(medication.frequency) }}</span>
            </div>

            <div class="flex items-center gap-2">
              <UIcon name="ic:round-event" class="text-muted text-sm" />
              <span class="text-sm text-default">
                {{ formatDate(medication.startDate) }} - {{ formatDate(medication.endDate) }}
              </span>
            </div>

            <div v-if="medication.description" class="flex items-start gap-2">
              <UIcon name="ic:round-notes" class="text-muted text-sm mt-0.5" />
              <p class="text-sm text-muted line-clamp-2">
                {{ medication.description }}
              </p>
            </div>
          </div>

          <div v-if="medication.scheduledMedications && medication.scheduledMedications.length > 0" class="mb-4">
            <h4 class="text-xs font-medium text-muted mb-2">
              Upcoming Doses
            </h4>
            <div class="space-y-1 max-h-20 overflow-y-auto">
              <div
                v-for="scheduledMed in medication.scheduledMedications.slice(0, 3)"
                :key="scheduledMed.id"
                class="flex items-center justify-between text-xs"
              >
                <span class="text-default">
                  {{ new Date(scheduledMed.scheduledAt).toLocaleDateString() }}
                  {{ new Date(scheduledMed.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </span>
                <UBadge
                  :color="scheduledMed.taken ? 'success' : 'warning'"
                  variant="soft"
                  size="xs"
                >
                  {{ scheduledMed.taken ? 'Taken' : 'Pending' }}
                </UBadge>
              </div>
              <div v-if="medication.scheduledMedications.length > 3" class="text-xs text-muted text-center">
                +{{ medication.scheduledMedications.length - 3 }} more
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <UButton
              v-if="medication.scheduledMedications?.some(sm => !sm.taken)"
              color="primary"
              variant="solid"
              size="sm"
              icon="ic:round-check"
              :loading="markAsTaken.isPending.value"
              class="flex-1"
              @click="handleMarkAsTaken(medication.scheduledMedications?.find(sm => !sm.taken)?.id || '')"
            >
              Mark as Taken
            </UButton>
            <UButton
              v-else
              color="success"
              variant="soft"
              size="sm"
              icon="ic:round-check-circle"
              disabled
              class="flex-1"
            >
              All Doses Taken
            </UButton>
          </div>
        </div>
      </div>

      <div class="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none" />
      <div class="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none" />
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
