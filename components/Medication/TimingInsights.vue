<script setup lang="ts">
import {
  formatTimingPreference,
  getAdjustmentSuggestion,
  getDataQuality,
  getTimingConcerns,
  isTimingAdjustmentNeeded
} from '~/utils/timingAnalysis'

const { medicationTimingInsights } = useQuery()
const { data: preferences, isLoading, refetch } = medicationTimingInsights.preferences()

// Check if there are any insights to show
const hasInsights = computed(() => {
  return preferences.value?.some((pref: any) => pref.totalTaken >= 3) || false
})
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center gap-2 sm:gap-3">
        <UIcon name="ic:round-analytics" class="text-primary text-lg sm:text-xl flex-shrink-0" />
        <h3 class="text-base sm:text-xl font-semibold text-default">
          Medication Timing Insights
        </h3>
      </div>
    </template>

    <template #headerExtra>
      <UButton
        size="sm"
        variant="outline"
        color="neutral"
        icon="ic:round-refresh"
        :loading="isLoading"
        :disabled="isLoading"
        @click="refetch()"
      />
    </template>

    <div class="space-y-4">
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <UIcon name="ic:round-refresh" class="animate-spin text-2xl text-primary" />
        <span class="ml-2 text-muted">Loading timing insights...</span>
      </div>

      <div v-else-if="!hasInsights" class="text-center py-8">
        <UIcon name="ic:round-schedule" class="text-muted text-3xl mb-2" />
        <p class="text-muted mb-4">
          Take medications consistently for a few days to see personalized timing insights.
        </p>
      </div>

      <div v-else class="space-y-6">
        <div class="flex items-center justify-between">
          <p class="text-sm text-muted">
            Based on your medication-taking patterns across different times of day:
          </p>
        </div>

        <div class="grid gap-3">
          <div
            v-for="pref in preferences"
            :key="pref.id"
            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <UIcon
                    :name="pref.quarter === 'morning' ? 'ic:round-wb-sunny'
                      : pref.quarter === 'afternoon' ? 'ic:round-wb-cloudy'
                        : pref.quarter === 'evening' ? 'ic:round-brightness-3'
                          : 'ic:round-nightlight-round'"
                    class="text-primary"
                  />
                  <span class="font-medium">
                    {{ formatTimingPreference(pref).quarterLabel }}
                  </span>
                </div>

                <div class="space-y-1 text-sm">
                  <div class="flex items-center gap-2">
                    <span class="text-muted">Preferred time:</span>
                    <span class="font-medium">{{ pref.preferredTime }}</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-muted">Pattern:</span>
                    <span
                      :class="pref.averageDelay === 0 ? 'text-success'
                        : Math.abs(pref.averageDelay) <= 10 ? 'text-warning'
                          : 'text-error'"
                    >
                      {{ formatTimingPreference(pref).delayText }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="text-muted">Data points:</span>
                    <span>{{ pref.totalTaken }} recordings</span>
                    <UBadge
                      :color="getDataQuality(pref).color as any"
                      variant="soft"
                      size="sm"
                    >
                      {{ getDataQuality(pref).quality }}
                    </UBadge>
                  </div>
                </div>

                <!-- Timing Concerns -->
                <div v-if="getTimingConcerns(pref).length > 0" class="mt-3">
                  <div class="space-y-1">
                    <div
                      v-for="concern in getTimingConcerns(pref)"
                      :key="concern"
                      class="flex items-start gap-2 text-sm"
                    >
                      <UIcon name="ic:round-warning" class="text-orange-500 mt-0.5 flex-shrink-0" />
                      <span class="text-orange-700 dark:text-orange-300">{{ concern }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="isTimingAdjustmentNeeded(pref)" class="flex-shrink-0 ml-4">
                <UBadge color="warning" variant="soft" size="sm">
                  Adjusted
                </UBadge>
              </div>
            </div>

            <div v-if="isTimingAdjustmentNeeded(pref)" class="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md border border-yellow-200 dark:border-yellow-700">
              <div class="flex items-start gap-2">
                <UIcon name="ic:round-lightbulb" class="text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Timing Suggestion
                  </p>
                  <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    {{ getAdjustmentSuggestion(pref) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>
