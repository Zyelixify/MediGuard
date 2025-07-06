<script setup lang="ts">
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

const { $trpc } = useNuxtApp()
const queryClient = useQueryClient()

// Use the new date formatting utility
const {
  formatTimeUntil,
  formatDateDisplay,
  formatTime12Hour,
  isDoseOverdue: isOverdue
} = useDateFormatting()

// Fetch the next scheduled dose
const { data: nextDose, isLoading, error, refetch, isFetching } = useQuery({
  queryKey: ['scheduledMedication', 'nextDose'],
  queryFn: () => $trpc.scheduledMedication.findNextDose.query(),
  refetchInterval: 60000, // Refetch every minute to keep time accurate
})

// Track refresh loading state separately from initial loading
const isRefreshing = computed(() => isFetching.value && !isLoading.value)

// Mark dose as taken with mutation
const markAsTakenMutation = useMutation({
  mutationFn: (id: string) => $trpc.scheduledMedication.updateTaken.mutate({
    id,
    taken: true,
  }),
  onSuccess: () => {
    useToastMessage('success', 'Dose marked as taken!')
    queryClient.invalidateQueries({ queryKey: ['scheduledMedication'] })
    queryClient.invalidateQueries({ queryKey: ['medication'] })
    refetch()
  },
  onError: (error) => {
    console.error('Failed to mark dose as taken:', error)
    useToastMessage('error', 'Failed to mark dose as taken')
  },
})

// Mark dose as taken
function markAsTaken() {
  if (!nextDose.value) {
    return
  }
  markAsTakenMutation.mutate(nextDose.value.id)
}

// Helper to determine if dose is overdue
const isDoseOverdue = computed(() => {
  if (!nextDose.value) {
    return false
  }
  return isOverdue(nextDose.value.scheduledAt)
})

// Helper to get time until dose using date-fns
const timeUntilDose = computed(() => {
  if (!nextDose.value) {
    return ''
  }
  return formatTimeUntil(nextDose.value.scheduledAt)
})

// Helper to format time using date-fns
const formattedTime = computed(() => {
  if (!nextDose.value) {
    return ''
  }
  return formatTime12Hour(nextDose.value.scheduledAt)
})

// Helper to format date using date-fns
const formattedDate = computed(() => {
  if (!nextDose.value) {
    return ''
  }
  return formatDateDisplay(nextDose.value.scheduledAt)
})
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center gap-2 sm:gap-3">
        <UIcon name="ic:round-medication" class="text-primary text-lg sm:text-xl flex-shrink-0" />
        <h3 class="text-base sm:text-lg font-semibold text-default">
          Next Dose
        </h3>
      </div>
    </template>

    <template #headerExtra>
      <div class="flex items-center gap-1 sm:gap-2">
        <UTooltip text="Refresh next dose">
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
        <!-- Mobile: Show only icon -->
        <UTooltip text="Refresh next dose">
          <UButton
            size="sm"
            variant="ghost"
            color="neutral"
            icon="ic:round-refresh"
            :loading="isRefreshing"
            :disabled="isRefreshing || isLoading"
            class="flex sm:hidden"
            @click="refetch()"
          />
        </UTooltip>
        <UButton
          v-if="nextDose"
          size="sm"
          :variant="isDoseOverdue ? 'solid' : 'outline'"
          :color="isDoseOverdue ? 'error' : 'success'"
          icon="ic:round-check"
          :loading="markAsTakenMutation.isPending.value"
          class="font-bold hidden sm:flex"
          @click="markAsTaken"
        >
          Mark Taken
        </UButton>
      </div>
    </template>

    <div class="space-y-4">
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>

      <div v-else-if="error" class="text-center py-8 space-y-4">
        <div class="p-4 bg-error/10 rounded-lg border border-error/20">
          <UIcon name="ic:round-error" class="text-error text-3xl mx-auto mb-2" />
          <p class="text-sm text-error font-medium">
            Failed to load next dose
          </p>
          <p class="text-xs text-error/80 mt-1">
            Please check your connection and try again
          </p>
        </div>
        <UButton size="sm" variant="outline" color="error" @click="refetch()">
          Try Again
        </UButton>
      </div>

      <div v-else-if="!nextDose" class="text-center py-8 space-y-4">
        <div class="p-4 bg-success/10 rounded-lg border border-success/20">
          <UIcon name="ic:round-check-circle" class="text-success text-3xl mx-auto mb-2" />
          <div class="space-y-1">
            <p class="text-sm font-medium text-success">
              All caught up!
            </p>
            <p class="text-xs text-success/80">
              No upcoming doses scheduled
            </p>
          </div>
        </div>
      </div>

      <div v-else class="space-y-4">
        <!-- Main Info Card -->
        <div class="relative overflow-hidden rounded-xl">
          <!-- Background gradient -->
          <div
            class="absolute inset-0 bg-gradient-to-br opacity-5"
            :class="isDoseOverdue ? 'from-red-500 to-red-600' : 'from-blue-500 to-primary-600'"
          />

          <!-- Content -->
          <div class="relative p-4 space-y-4">
            <!-- Medication Header -->
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-default text-2xl sm:text-3xl leading-tight mb-1">
                  {{ nextDose.medication.name }}
                </h4>
                <div class="flex items-center gap-2">
                  <UIcon name="ic:round-scale" class="text-muted text-base" />
                  <span class="text-base text-muted font-semibold">
                    {{ nextDose.medication.dosage }}
                  </span>
                </div>
              </div>
              <div
                class="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs sm:text-sm font-bold"
                :class="isDoseOverdue ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'"
              >
                <UIcon
                  :name="isDoseOverdue ? 'ic:round-access-time' : 'ic:round-hourglass-empty'"
                  class="text-xs sm:text-sm"
                />
                {{ timeUntilDose }}
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-center gap-2 sm:gap-2 py-2">
                <UIcon
                  :name="isDoseOverdue ? 'ic:round-warning' : 'ic:round-schedule'"
                  :class="isDoseOverdue ? 'text-red-500' : 'text-primary'"
                  class="text-xl sm:text-2xl flex-shrink-0"
                />
                <div class="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 sm:gap-3">
                  <span class="text-2xl sm:text-3xl md:text-4xl font-black text-default">
                    {{ formattedTime }}
                  </span>
                  <span class="text-sm sm:text-base text-muted font-medium">
                    {{ formattedDate }}
                  </span>
                </div>
              </div>

              <!-- Frequency and Details Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div class="flex items-center gap-2 p-2 bg-elevated rounded-lg border border-default">
                  <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <UIcon name="ic:round-repeat" class="text-primary text-base" />
                  </div>
                  <div>
                    <div class="text-xs font-medium text-muted">
                      Frequency
                    </div>
                    <div class="text-sm font-bold text-default">
                      {{ nextDose.medication.frequency }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 p-2 bg-elevated rounded-lg border border-default">
                  <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <UIcon name="ic:round-info" class="text-primary text-base" />
                  </div>
                  <div>
                    <div class="text-xs font-medium text-muted">
                      Status
                    </div>
                    <div
                      class="text-sm font-bold"
                      :class="isDoseOverdue ? 'text-red-600' : 'text-primary'"
                    >
                      {{ isDoseOverdue ? 'Overdue' : 'On Schedule' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="nextDose.medication.description" class="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-default">
              <div class="flex items-start gap-2">
                <UIcon name="ic:round-description" class="text-muted text-base mt-0.5 flex-shrink-0" />
                <div>
                  <div class="text-xs font-medium text-muted mb-1">
                    Notes
                  </div>
                  <p class="text-sm text-default leading-relaxed">
                    {{ nextDose.medication.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Action Button -->
        <div class="sm:hidden">
          <UButton
            block
            size="lg"
            :variant="isDoseOverdue ? 'solid' : 'outline'"
            :color="isDoseOverdue ? 'error' : 'success'"
            icon="ic:round-check"
            :loading="markAsTakenMutation.isPending.value"
            class="font-bold text-base py-2 rounded-xl"
            @click="markAsTaken"
          >
            {{ isDoseOverdue ? 'Mark Overdue Dose as Taken' : 'Mark as Taken' }}
          </UButton>
        </div>
      </div>
    </div>
  </Card>
</template>
