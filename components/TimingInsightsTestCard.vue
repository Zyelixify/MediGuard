<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { RouterOutput } from '~/types'

const { $trpc } = useNuxtApp()

const results = ref<RouterOutput['medicationTimingPreference']['getTimingPreferences'] | null>(null)

type ScenarioKey = 'consistently_late' | 'consistently_early' | 'wildly_overdue'
const scenarios: Record<ScenarioKey, { key: ScenarioKey, name: string, description: string, expected: string, icon: string, color: string }> = {
  consistently_late: {
    key: 'consistently_late',
    name: 'Consistently Late',
    description: 'Someone always 40 minutes late',
    expected: 'Should adjust morning times 10 minutes later (affects ALL morning meds)',
    icon: 'ic:round-schedule',
    color: 'orange'
  },
  wildly_overdue: {
    key: 'wildly_overdue',
    name: 'Wildly Overdue',
    description: 'Extreme delays over 2 hours',
    expected: 'Should filter out extreme delays, stay at default time',
    icon: 'ic:round-warning',
    color: 'red'
  },
  consistently_early: {
    key: 'consistently_early',
    name: 'Consistently Early',
    description: 'Someone always 30 minutes early',
    expected: 'Should adjust morning times 8 minutes earlier (affects ALL morning meds)',
    icon: 'ic:round-access-time',
    color: 'blue'
  }
}

const queryClient = useQueryClient()

const runScenarioMutation = useMutation({
  mutationFn: async (scenario: ScenarioKey) => {
    await $trpc.medicationTimingPreference.simulateTimingScenarios.mutate({ scenario: 'reset' })
    await $trpc.medicationTimingPreference.simulateTimingScenarios.mutate({ scenario })
    return await $trpc.medicationTimingPreference.getTimingPreferences.query()
  },
  onSuccess: async (data, scenario) => {
    results.value = data
    useToastMessage('success', `Scenario "${scenario}" completed!`)
    await queryClient.invalidateQueries({ queryKey: ['medicationTimingPreference'] })
  },
  onError: (error) => {
    console.error('Scenario failed:', error)
    useToastMessage('error', 'Failed to run scenario')
  },
})

const resetDataMutation = useMutation({
  mutationFn: async () => {
    await $trpc.medicationTimingPreference.simulateTimingScenarios.mutate({
      scenario: 'reset'
    })
  },
  onSuccess: async () => {
    results.value = null
    useToastMessage('success', 'Timing data reset!')
    await queryClient.invalidateQueries({ queryKey: ['medicationTimingPreference'] })
  },
  onError: (error) => {
    console.error('Reset failed:', error)
    useToastMessage('error', 'Failed to reset data')
  },
})
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center gap-2 sm:gap-3">
        <UIcon name="ic:round-science" class="text-primary text-lg sm:text-xl flex-shrink-0" />
        <h3 class="text-base sm:text-xl font-semibold text-default">
          Timing System Demo (Dev Only)
        </h3>
      </div>
    </template>

    <template #headerExtra>
      <div class="flex items-center gap-1 sm:gap-2">
        <UTooltip text="Reset all timing data">
          <UButton
            size="sm"
            variant="outline"
            color="error"
            icon="ic:round-refresh"
            :loading="resetDataMutation.isPending.value"
            :disabled="resetDataMutation.isPending.value || runScenarioMutation.isPending.value"
            @click="resetDataMutation.mutate()"
          />
        </UTooltip>
      </div>
    </template>

    <div class="space-y-4">
      <p class="text-sm text-muted">
        Test scenarios to simulate different timing behaviors and how the system adapts to user preferences. These demonstrate quarter-based learning - morning preferences apply to ALL morning medications regardless of frequency.
      </p>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="scenario in Object.values(scenarios)"
          :key="scenario.name"
          class="relative overflow-hidden rounded-lg border border-nord-400 bg-card hover:bg-muted/30 transition-colors"
        >
          <div class="p-4 space-y-3">
            <div class="flex items-center gap-2">
              <UIcon
                :name="scenario.icon"
                :class="`text-${scenario.color}-500`"
                class="flex-shrink-0"
              />
              <h4 class="font-semibold text-default">
                {{ scenario.name }}
              </h4>
            </div>

            <p class="text-sm text-muted">
              {{ scenario.description }}
            </p>

            <div class="bg-primary/10 rounded p-2 border border-primary/20">
              <p class="text-xs font-medium text-primary">
                Expected: {{ scenario.expected }}
              </p>
            </div>

            <UButton
              size="sm"
              variant="outline"
              color="primary"
              :loading="runScenarioMutation.isPending.value"
              :disabled="runScenarioMutation.isPending.value || resetDataMutation.isPending.value"
              class="w-full"
              @click="runScenarioMutation.mutate(scenario.key)"
            >
              <template #leading>
                <UIcon name="ic:round-play-arrow" />
              </template>
              Test {{ scenario.name }}
            </UButton>
          </div>
        </div>
      </div>

      <div v-if="results && results.length > 0" class="space-y-4">
        <div class="flex items-center gap-2 border-b pb-2">
          <UIcon name="ic:round-analytics" class="text-primary" />
          <h4 class="font-semibold text-default">
            Test Results
          </h4>
          <UBadge variant="soft" color="success" size="sm">
            {{ results.length }} {{ results.length === 1 ? 'preference' : 'preferences' }}
          </UBadge>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="pref in results"
            :key="pref.id"
            class="relative overflow-hidden rounded-lg border bg-card"
          >
            <!-- Background gradient based on delay -->
            <div
              class="absolute inset-0 opacity-5"
              :class="pref.averageDelay > 0
                ? 'bg-gradient-to-br from-orange-500 to-red-500'
                : pref.averageDelay < 0
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  : 'bg-gradient-to-br from-green-500 to-emerald-500'"
            />

            <!-- Content -->
            <div class="relative p-4 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon
                    :name="pref.quarter === 'morning'
                      ? 'ic:round-wb-sunny'
                      : pref.quarter === 'afternoon'
                        ? 'ic:round-wb-sunny'
                        : pref.quarter === 'evening'
                          ? 'ic:round-nights-stay'
                          : 'ic:round-bedtime'"
                    class="text-primary"
                  />
                  <span class="font-medium text-default capitalize">{{ pref.quarter }}</span>
                </div>
                <UBadge
                  :color="pref.averageDelay > 0 ? 'warning' : pref.averageDelay < 0 ? 'info' : 'success'"
                  variant="soft"
                  size="sm"
                >
                  {{ pref.averageDelay > 0 ? '+' : '' }}{{ pref.averageDelay }}min
                </UBadge>
              </div>

              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted">Preferred Time:</span>
                  <span class="font-mono font-medium text-default">{{ pref.preferredTime }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Data Points:</span>
                  <span class="font-medium text-default">{{ pref.totalTaken }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Last Adjusted:</span>
                  <span class="text-xs text-muted">{{ new Date(pref.lastAdjusted).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="results && results.length === 0" class="text-center py-8">
        <div class="p-4 bg-muted/20 rounded-lg border border-muted/30">
          <UIcon name="ic:round-hourglass-empty" class="text-muted text-3xl mx-auto mb-2" />
          <p class="text-sm font-medium text-muted">
            No timing data found
          </p>
          <p class="text-xs text-muted/80 mt-1">
            Run a scenario to see results
          </p>
        </div>
      </div>
    </div>
  </Card>
</template>
