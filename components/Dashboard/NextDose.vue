<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'

const { $trpc } = useNuxtApp()
const queryClient = useQueryClient()

const { useRealTimeCountdown } = useDateFormatting()

const { scheduledMedication } = useQuery()
const { data: nextDose, isLoading, error, refetch, isFetching } = scheduledMedication.nextDose()

const {
  isSupported,
  isEnabled,
  canRequestPermission,
  requestPermission,
  notificationAnimation,
  lastNotificationEvent
} = useNotifications()

const isRefreshing = computed(() => isFetching.value && !isLoading.value)
const scheduledAt = computed(() => nextDose.value?.scheduledAt || null)

const {
  timeUntil,
  isOverdue,
  isDoseTimeNow,
  formattedTime,
  formattedDate
} = useRealTimeCountdown(scheduledAt)

const nextDoseInfo = computed(() => {
  if (!nextDose.value) {
    return {}
  }

  return {
    isOverdue: isOverdue.value,
    timeUntil: timeUntil.value,
    formattedTime: formattedTime.value,
    formattedDate: formattedDate.value
  }
})

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

function markAsTaken() {
  if (!nextDose.value) {
    return
  }
  markAsTakenMutation.mutate(nextDose.value.id)
}
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center gap-2 sm:gap-3">
        <UIcon name="ic:round-medication" class="text-primary text-lg sm:text-xl flex-shrink-0" />
        <h3 class="text-base sm:text-xl font-semibold text-default">
          Next Dose
        </h3>
      </div>
    </template>

    <template #headerExtra>
      <div class="flex items-center gap-1 sm:gap-2">
        <Transition name="notification-pulse">
          <div
            v-if="notificationAnimation"
            class="flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full text-xs font-medium border border-primary-300 dark:border-primary-700"
          >
            <UIcon name="ic:round-notifications-active" class="text-sm animate-pulse" />
            <span class="hidden sm:inline">Notification sent</span>
          </div>
        </Transition>

        <UTooltip
          v-if="isSupported && canRequestPermission"
          text="Enable medication notifications"
        >
          <UButton
            size="sm"
            variant="outline"
            color="primary"
            icon="ic:round-notifications"
            @click="requestPermission()"
          />
        </UTooltip>

        <UTooltip
          v-else-if="isSupported && isEnabled"
          :text="lastNotificationEvent
            ? `Notifications enabled. Last sent: ${lastNotificationEvent.type} for ${lastNotificationEvent.medicationName} at ${new Date(lastNotificationEvent.timestamp).toLocaleTimeString()}`
            : 'Notifications enabled'"
        >
          <UBadge color="success" variant="soft" size="lg">
            <UIcon name="ic:round-notifications-active" class="mr-1" />
            On
          </UBadge>
        </UTooltip>

        <UTooltip text="Refresh next dose">
          <UButton
            size="sm"
            variant="outline"
            color="neutral"
            icon="ic:round-refresh"
            :loading="isRefreshing"
            :disabled="isRefreshing || isLoading"
            @click="refetch()"
          />
        </UTooltip>
        <UButton
          v-if="nextDose"
          size="sm"
          :variant="nextDoseInfo.isOverdue ? 'solid' : 'outline'"
          :color="nextDoseInfo.isOverdue ? 'error' : 'success'"
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
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
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
        <div
          class="relative overflow-hidden rounded-xl"
          :class="nextDoseInfo.isOverdue ? 'animate-pulse' : ''"
        >
          <!-- Background gradient -->
          <div
            class="absolute inset-0 bg-gradient-to-br opacity-5 transition-all duration-500"
            :class="nextDoseInfo.isOverdue ? 'from-red-500 to-red-600 animate-pulse' : 'from-blue-500 to-primary-600'"
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
                class="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs sm:text-sm font-bold transition-all duration-300"
                :class="[
                  nextDoseInfo.isOverdue
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
                  isDoseTimeNow ? 'ring-2 ring-yellow-400 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : '',
                ]"
              >
                <UIcon
                  :name="nextDoseInfo.isOverdue ? 'ic:round-access-time' : isDoseTimeNow ? 'ic:round-schedule' : 'ic:round-hourglass-empty'"
                  class="text-xs sm:text-sm"
                  :class="isDoseTimeNow ? 'animate-pulse' : ''"
                />
                <span :class="isDoseTimeNow ? 'animate-pulse' : ''">
                  {{ nextDoseInfo.timeUntil }}
                </span>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-center gap-2 sm:gap-2 py-2">
                <UIcon
                  :name="nextDoseInfo.isOverdue ? 'ic:round-warning' : 'ic:round-schedule'"
                  :class="nextDoseInfo.isOverdue ? 'text-red-500' : 'text-primary'"
                  class="text-xl sm:text-2xl flex-shrink-0"
                />
                <div class="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 sm:gap-3">
                  <span class="text-2xl sm:text-3xl md:text-4xl font-black text-default">
                    {{ nextDoseInfo.formattedTime }}
                  </span>
                  <span class="text-sm sm:text-base text-muted font-medium">
                    {{ nextDoseInfo.formattedDate }}
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
                    <div class="text-sm font-bold text-primary">
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
                      :class="nextDoseInfo.isOverdue ? 'text-red-600' : 'text-primary'"
                    >
                      {{ nextDoseInfo.isOverdue ? 'Overdue' : 'On Schedule' }}
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
            :variant="nextDoseInfo.isOverdue ? 'solid' : 'outline'"
            :color="nextDoseInfo.isOverdue ? 'error' : 'success'"
            icon="ic:round-check"
            :loading="markAsTakenMutation.isPending.value"
            class="font-bold text-base py-2 rounded-xl"
            @click="markAsTaken"
          >
            {{ nextDoseInfo.isOverdue ? 'Mark Overdue Dose as Taken' : 'Mark as Taken' }}
          </UButton>
        </div>
      </div>
    </div>
  </Card>
</template>

<style scoped>
.notification-pulse-enter-active,
.notification-pulse-leave-active {
  transition: all 0.3s ease;
}

.notification-pulse-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-4px);
}

.notification-pulse-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-4px);
}

.notification-pulse-enter-to,
.notification-pulse-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Additional pulse animation for the notification */
@keyframes notification-glow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
  }
}

.notification-pulse-enter-active {
  animation: notification-glow 1.5s ease-in-out;
}
</style>
