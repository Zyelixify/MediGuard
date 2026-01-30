<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MedicationGetMany } from '~/types'

type ScheduledMedicationItem = MedicationGetMany['scheduledMedications'][number]

const props = defineProps<{ medications: MedicationGetMany[] }>()

const { $trpc } = useNuxtApp()
const queryClient = useQueryClient()

// Use the new date formatting utility
const {
  formatTimeUntil,
  formatDateDisplay,
  formatTime12Hour,
  formatMedicationDate,
  getDoseStatus
} = useDateFormatting()

const markAsTaken = useMutation({
  mutationFn: ({ id, taken, takenAt }: { id: string, taken: boolean, takenAt?: Date }) =>
    $trpc.scheduledMedication.updateTaken.mutate({
      id,
      taken,
      takenAt
    }),
  mutationKey: ['scheduledMedication', 'updateTaken'],
  onSuccess: async () => {
    useToastMessage('success', 'Medication marked as taken')

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['scheduledMedication'] }),
      queryClient.invalidateQueries({ queryKey: ['medication'] }),
      queryClient.invalidateQueries({ queryKey: ['timingPreferences'] })
    ])
  },
  onError: (error) => {
    console.error('Failed to mark medication as taken:', error)
    useToastMessage('error', 'Failed to mark medication as taken')
  },
})

function handleMarkAsTaken(medicationId: string) {
  markAsTaken.mutate({
    id: medicationId,
    taken: true,
    takenAt: new Date()
  })
}

function formatFrequency(frequency: string): string {
  return frequency.toLowerCase().replace(/^\w/, c => c.toUpperCase())
}

function getNextDose(scheduledMedications: MedicationGetMany['scheduledMedications']) {
  if (!scheduledMedications || scheduledMedications.length === 0) {
    return null
  }

  const now = new Date()
  // Find the next untaken dose
  const nextDose = scheduledMedications.find((sm: ScheduledMedicationItem) => !sm.taken && new Date(sm.scheduledAt) >= now)

  // If no future doses, return the first untaken dose
  return nextDose || scheduledMedications.find((sm: ScheduledMedicationItem) => !sm.taken)
}

function getUpcomingDoses(scheduledMedications: MedicationGetMany['scheduledMedications']) {
  if (!scheduledMedications || scheduledMedications.length === 0) {
    return []
  }

  const now = new Date()
  // Get future untaken doses, limit to 3
  return scheduledMedications
    .filter((sm: ScheduledMedicationItem) => !sm.taken && new Date(sm.scheduledAt) > now)
    .slice(0, 3)
}

// Computed property to sort medications and their scheduled doses
const sortedMedications = computed(() => {
  return props.medications.map(medication => ({
    ...medication,
    scheduledMedications: medication.scheduledMedications.sort((a: ScheduledMedicationItem, b: ScheduledMedicationItem) => {
      // Sort by date ascending (earliest first)
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    })
  }))
})
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
      <div class="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        <div
          v-for="medication in sortedMedications"
          :key="medication.id"
          class="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 h-fit"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <UIcon name="ic:round-medication" class="text-primary text-lg" />
              <h3 class="font-semibold text-default truncate">
                {{ medication.name }}
              </h3>
            </div>
            <UBadge
              :color="medication.scheduledMedications?.some((sm: any) => !sm.taken) ? 'warning' : 'success'"
              variant="soft"
              size="sm"
            >
              {{ medication.scheduledMedications?.some((sm: any) => !sm.taken) ? 'Ongoing' : 'Complete' }}
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
                {{ formatMedicationDate(medication.startDate) }} - {{ formatMedicationDate(medication.endDate) }}
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
            <!-- Next Dose Section -->
            <div v-if="getNextDose(medication.scheduledMedications)" class="mb-3">
              <h4 class="text-xs font-medium text-default mb-2">
                Next Dose
              </h4>
              <div class="bg-primary/10 dark:bg-primary/20 rounded-lg p-3 border border-primary/20">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <UIcon name="ic:round-schedule" class="text-primary text-sm" />
                    <div class="space-y-1">
                      <div class="text-sm font-medium text-default">
                        {{ formatTime12Hour(getNextDose(medication.scheduledMedications)!.scheduledAt) }}
                      </div>
                      <div class="text-xs text-muted">
                        {{ formatDateDisplay(getNextDose(medication.scheduledMedications)!.scheduledAt) }}
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col items-end gap-1">
                    <UBadge
                      color="primary"
                      variant="soft"
                      size="sm"
                    >
                      Next
                    </UBadge>
                    <span class="text-xs text-muted">
                      {{ formatTimeUntil(getNextDose(medication.scheduledMedications)!.scheduledAt) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Upcoming Doses Section -->
            <div v-if="getUpcomingDoses(medication.scheduledMedications).length > 0">
              <h4 class="text-xs font-medium text-muted mb-2">
                Upcoming Doses
              </h4>
              <div class="space-y-1 max-h-20 overflow-y-auto">
                <div
                  v-for="scheduledMed in getUpcomingDoses(medication.scheduledMedications)"
                  :key="scheduledMed.id"
                  class="flex items-center justify-between text-xs"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-default">
                      {{ formatTime12Hour(scheduledMed.scheduledAt) }}
                    </span>
                    <span class="text-muted">
                      {{ formatDateDisplay(scheduledMed.scheduledAt) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-muted">
                      {{ formatTimeUntil(scheduledMed.scheduledAt) }}
                    </span>
                    <UBadge
                      :color="getDoseStatus(scheduledMed.scheduledAt) === 'overdue' ? 'error' : 'neutral'"
                      variant="soft"
                      size="xs"
                    >
                      {{ getDoseStatus(scheduledMed.scheduledAt) === 'overdue' ? 'Overdue' : 'Pending' }}
                    </UBadge>
                  </div>
                </div>
                <UModal>
                  <div v-if="medication.scheduledMedications.filter((sm: any) => !sm.taken).length > 4" class="text-xs text-center cursor-pointer hover:underline text-primary-300">
                    +{{ medication.scheduledMedications.filter((sm: any) => !sm.taken).length - 4 }} more
                  </div>
                  <template #content>
                    <div class="p-2 max-h-60 overflow-y-auto custom-scrollbar m-2">
                      <h4 class="text-sm font-medium text-default mb-2">
                        All Upcoming Doses
                      </h4>
                      <div class="space-y-1">
                        <div
                          v-for="scheduledMed in medication.scheduledMedications.filter((sm: any) => !sm.taken)"
                          :key="scheduledMed.id"
                          class="flex items-center justify-between text-xs"
                        >
                          <div class="flex items-center gap-2">
                            <span class="text-default">
                              {{ formatTime12Hour(scheduledMed.scheduledAt) }}
                            </span>
                            <span class="text-muted">
                              {{ formatDateDisplay(scheduledMed.scheduledAt) }}
                            </span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="text-muted">
                              {{ formatTimeUntil(scheduledMed.scheduledAt) }}
                            </span>
                            <UBadge
                              :color="getDoseStatus(scheduledMed.scheduledAt) === 'overdue' ? 'error' : 'neutral'"
                              variant="soft"
                              size="md"
                            >
                              {{ getDoseStatus(scheduledMed.scheduledAt) === 'overdue' ? 'Overdue' : 'Pending' }}
                            </UBadge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </UModal>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <UButton
              v-if="getNextDose(medication.scheduledMedications)"
              color="success"
              variant="solid"
              size="sm"
              icon="ic:round-check"
              :loading="markAsTaken.isPending.value"
              class="flex-1"
              @click="handleMarkAsTaken(getNextDose(medication.scheduledMedications)!.id)"
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
    </div>
  </div>
</template>
