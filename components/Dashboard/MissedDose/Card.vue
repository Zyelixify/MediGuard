<script setup lang="ts">
import type { ScheduledMedicationGetMany } from '~/types'

const { data: session } = useAuth()

const { scheduledMedication } = useQuery()

// Only query if session is available
const { data: missedDosesData, isLoading, isFetching, refetch, error } = scheduledMedication.all({
  where: {
    scheduledAt: { lt: new Date() },
    medication: {
      account: {
        caretakers: {
          some: {
            caretakerId: session.value?.user.id ?? 'invalid_ID',
            isConfirmed: true
          }
        }
      }
    }
  }
})

const missedDoses = computed(() => {
  if (error.value) {
    console.error('Error fetching missed doses:', error.value)
    return []
  }
  return missedDosesData.value || []
})
const recentMissedDoses = computed(() => missedDoses.value.slice(0, 4)) // Show first 4 in card

const isRefreshing = computed(() => isFetching.value && !isLoading.value)

// Calculate severity based on how many missed doses and how recent
const severity = computed(() => {
  if (missedDoses.value.length === 0) {
    return 'none'
  }

  const recentMissed = missedDoses.value.filter((dose: ScheduledMedicationGetMany) => {
    const hoursSinceScheduled = (new Date().getTime() - new Date(dose.scheduledAt).getTime()) / (1000 * 60 * 60)
    return hoursSinceScheduled <= 24 // Within last 24 hours
  })

  if (recentMissed.length >= 3) {
    return 'high'
  }
  if (recentMissed.length >= 1) {
    return 'medium'
  }
  return 'low'
})

const severityConfig = {
  none: { color: 'success' as const, icon: 'ic:round-check-circle', text: 'All doses on track' },
  low: { color: 'warning' as const, icon: 'ic:round-warning', text: 'Some missed doses' },
  medium: { color: 'error' as const, icon: 'ic:round-error', text: 'Multiple missed doses' },
  high: { color: 'error' as const, icon: 'ic:round-dangerous', text: 'Critical: Many missed doses' }
}

const currentSeverityConfig = computed(() => severityConfig[severity.value])

// Expose functions and data that the dashboard might need
defineExpose({
  missedCount: computed(() => missedDoses.value.length),
  severity
})
</script>

<template>
  <ClientOnly>
    <Card>
      <template #header>
        <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
          <UIcon
            :name="currentSeverityConfig.icon"
            class="text-lg sm:text-xl flex-shrink-0"
            :class="[
              severity === 'none' ? 'text-success'
              : severity === 'low' ? 'text-warning'
                : 'text-error',
            ]"
          />
          <h2 class="text-base sm:text-xl font-semibold text-default">
            Missed Doses
          </h2>
          <UBadge
            v-if="missedDoses.length > 0"
            :color="currentSeverityConfig.color"
            variant="soft"
            size="sm"
            class="sm:size-md"
          >
            {{ missedDoses.length }}
          </UBadge>
        </div>
      </template>

      <template #headerExtra>
        <div class="flex items-center gap-1 sm:gap-2">
          <UTooltip text="Refresh missed doses">
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

          <UModal v-if="missedDoses.length > 0">
            <UButton
              size="sm"
              variant="outline"
              :color="currentSeverityConfig.color"
              :icon="currentSeverityConfig.icon"
            >
              View All
            </UButton>
            <template #content>
              <div class="p-6 max-w-2xl">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-2">
                    <UIcon
                      :name="currentSeverityConfig.icon"
                      class="text-xl"
                      :class="[
                        severity === 'low' ? 'text-warning' : 'text-error',
                      ]"
                    />
                    <h3 class="text-xl font-semibold text-default">
                      All Missed Doses
                    </h3>
                  </div>
                  <UBadge
                    :color="currentSeverityConfig.color"
                    variant="soft"
                  >
                    {{ missedDoses.length }} missed
                  </UBadge>
                </div>

                <LoadingSpinner v-if="isLoading" text="Loading missed doses..." />

                <div v-else-if="error" class="flex items-center justify-center py-8">
                  <div class="text-center space-y-3">
                    <UIcon name="ic:round-error" class="text-error text-2xl mx-auto" />
                    <p class="text-sm text-muted">
                      Failed to load missed doses
                    </p>
                    <UButton
                      size="sm"
                      variant="outline"
                      :loading="isFetching"
                      @click="refetch()"
                    >
                      Retry
                    </UButton>
                  </div>
                </div>

                <div v-else class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  <DashboardMissedDoseItem
                    v-for="dose in missedDoses"
                    :key="dose.id"
                    :missed-dose="dose"
                    :show-full-date-time="true"
                    variant="modal"
                  />
                </div>
              </div>
            </template>
          </UModal>
        </div>
      </template>

      <LoadingSpinner v-if="isLoading" text="Loading missed doses..." />

      <div v-else-if="error" class="flex flex-col items-center justify-center py-8 space-y-3">
        <UIcon name="ic:round-error" class="text-error text-4xl" />
        <div class="space-y-1 text-center">
          <p class="text-sm font-medium text-default">
            Failed to load missed doses
          </p>
          <p class="text-xs text-muted">
            Please try refreshing the page or contact support if the problem persists
          </p>
        </div>
        <UButton
          size="sm"
          variant="outline"
          :loading="isFetching"
          @click="refetch()"
        >
          Retry
        </UButton>
      </div>

      <div v-else-if="missedDoses.length === 0" class="flex flex-col items-center justify-center py-8 space-y-3">
        <UIcon name="ic:round-check-circle" class="text-success text-4xl" />
        <div class="space-y-1 text-center">
          <p class="text-sm font-medium text-default">
            No missed doses
          </p>
          <p class="text-xs text-muted">
            All patients are staying on track with their medications
          </p>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div
          v-if="severity !== 'none'"
          class="flex items-center gap-2 p-3 rounded-lg border"
          :class="[
            severity === 'low' ? 'bg-warning-50 border-warning-200'
            : 'bg-error-50 border-error-200',
          ]"
        >
          <UIcon
            :name="currentSeverityConfig.icon"
            class="text-sm flex-shrink-0"
            :class="[
              severity === 'low' ? 'text-warning-700' : 'text-error-700',
            ]"
          />
          <p
            class="text-sm font-medium"
            :class="[
              severity === 'low' ? 'text-warning-700' : 'text-error-700',
            ]"
          >
            {{ currentSeverityConfig.text }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-default">
          <DashboardMissedDoseItem
            v-for="dose in recentMissedDoses"
            :key="dose.id"
            :missed-dose="dose"
            variant="card"
          />
        </div>

        <div v-if="missedDoses.length > 4" class="text-center pt-2">
          <p class="text-xs text-muted">
            Showing {{ recentMissedDoses.length }} of {{ missedDoses.length }} missed doses
          </p>
        </div>
      </div>
    </Card>

    <template #fallback>
      <Card>
        <template #header>
          <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
            <UIcon name="ic:round-warning" class="text-warning text-lg sm:text-xl flex-shrink-0" />
            <h2 class="text-base sm:text-xl font-semibold text-default">
              Missed Doses
            </h2>
          </div>
        </template>
        <LoadingSpinner />
      </Card>
    </template>
  </ClientOnly>
</template>
