<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'

const { $trpc } = useNuxtApp()
const { formatScheduledTime, formatDateTime } = useDateUtils()

// Fetch the next scheduled dose
const { data: nextDose, isLoading, error, refetch } = useQuery({
  queryKey: ['scheduledMedication', 'nextDose'],
  queryFn: () => $trpc.scheduledMedication.findNextDose.query(),
  refetchInterval: 60000, // Refetch every minute to keep time accurate
})

// Mark dose as taken
async function markAsTaken() {
  if (!nextDose.value) {
    return
  }

  try {
    await $trpc.scheduledMedication.updateTaken.mutate({
      id: nextDose.value.id,
      taken: true,
    })

    useToastMessage('success', 'Dose marked as taken!')

    // Refetch to get the next dose
    await refetch()
  }
  catch (error) {
    console.error('Failed to mark dose as taken:', error)
    useToastMessage('error', 'Failed to mark dose as taken')
  }
}
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="ic:round-medication" class="text-primary text-xl" />
        <h3 class="text-lg font-semibold text-default">
          Next Dose
        </h3>
      </div>
    </template>

    <template #headerExtra>
      <div class="flex items-center gap-2">
        <UButton
          size="sm"
          variant="outline"
          color="neutral"
          icon="ic:round-refresh"
          :loading="isLoading"
          @click="refetch()"
        />
        <UButton
          v-if="nextDose"
          size="sm"
          variant="outline"
          color="success"
          icon="ic:round-check"
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

      <div v-else-if="error" class="text-center py-8 space-y-3">
        <UIcon name="ic:round-error" class="text-error-400 text-3xl mx-auto" />
        <p class="text-sm text-error-400">
          Failed to load next dose
        </p>
        <UButton size="sm" variant="outline" @click="refetch()">
          Try Again
        </UButton>
      </div>

      <div v-else-if="!nextDose" class="text-center py-8 space-y-3">
        <UIcon name="ic:round-check-circle" class="text-success-500 text-3xl mx-auto" />
        <div class="space-y-1">
          <p class="text-sm font-medium text-default">
            All caught up!
          </p>
          <p class="text-xs text-muted">
            No upcoming doses scheduled
          </p>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="space-y-1">
          <h4 class="font-semibold text-default text-lg">
            {{ nextDose.medication.name }}
          </h4>
          <p class="text-sm text-muted">
            {{ nextDose.medication.dosage }}
          </p>
          <p v-if="nextDose.medication.description" class="text-xs text-muted">
            {{ nextDose.medication.description }}
          </p>
        </div>

        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <UIcon name="ic:round-schedule" class="text-primary text-lg" />
            <div class="space-y-1">
              <p class="text-sm font-medium text-default">
                {{ formatScheduledTime(nextDose.scheduledAt) }}
              </p>
              <p class="text-xs text-muted">
                {{ formatDateTime(nextDose.scheduledAt) }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs text-muted">
          <UIcon name="ic:round-repeat" />
          <span>{{ nextDose.medication.frequency }}</span>
        </div>

        <div class="pt-2 sm:hidden">
          <UButton
            block
            variant="solid"
            color="success"
            icon="ic:round-check"
            @click="markAsTaken"
          >
            Mark as Taken
          </UButton>
        </div>
      </div>
    </div>
  </Card>
</template>
