<script setup lang="ts">
import type { ScheduledMedicationGetMany } from '~/types'

interface Props {
  missedDose: ScheduledMedicationGetMany
  showFullDateTime?: boolean
  variant?: 'card' | 'modal'
}

const props = withDefaults(defineProps<Props>(), {
  showFullDateTime: false,
  variant: 'card'
})

const {
  formatTimeUntilCompact,
  formatFullDateTime
} = useDateFormatting()

const formattedTime = computed(() => {
  if (props.showFullDateTime) {
    return formatFullDateTime(props.missedDose.scheduledAt)
  }

  return formatTimeUntilCompact(props.missedDose.scheduledAt)
})

const severityColor = computed(() => {
  const now = new Date()
  const diffInHours = (now.getTime() - new Date(props.missedDose.scheduledAt).getTime()) / (1000 * 60 * 60)

  if (diffInHours > 24) {
    return 'error'
  }
  if (diffInHours > 12) {
    return 'warning'
  }
  return 'primary'
})

const severityBgColor = computed(() => {
  const now = new Date()
  const diffInHours = (now.getTime() - new Date(props.missedDose.scheduledAt).getTime()) / (1000 * 60 * 60)

  if (diffInHours > 24) {
    return 'bg-error-50'
  }
  if (diffInHours > 12) {
    return 'bg-warning-50'
  }
  return 'bg-primary-50'
})

const severityTextColor = computed(() => {
  const now = new Date()
  const diffInHours = (now.getTime() - new Date(props.missedDose.scheduledAt).getTime()) / (1000 * 60 * 60)

  if (diffInHours > 24) {
    return 'text-error-700'
  }
  if (diffInHours > 12) {
    return 'text-warning-700'
  }
  return 'text-primary-700'
})

const isModalVariant = computed(() => props.variant === 'modal')
</script>

<template>
  <div
    class="flex items-start gap-3 p-3 rounded-lg border border-default hover:border-primary transition-colors"
    :class="[
      isModalVariant ? 'bg-elevated' : 'bg-background',
      isModalVariant ? 'border-none shadow-sm' : '',
    ]"
  >
    <div
      class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
      :class="severityBgColor"
    >
      <UIcon
        name="ic:round-schedule"
        class="text-sm"
        :class="severityTextColor"
      />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2 mb-1">
        <p class="text-sm font-medium text-default">
          {{ missedDose.medication.account?.name || 'Patient' }}
        </p>
        <span class="text-xs text-muted flex-shrink-0">
          {{ formattedTime }}
        </span>
      </div>

      <p class="text-sm text-default font-medium mb-1">
        Medication: {{ missedDose.medication.name }}
      </p>

      <p class="text-xs text-muted mb-2">
        Dosage: {{ missedDose.medication.dosage }} • Scheduled for {{ formatFullDateTime(missedDose.scheduledAt) }}
      </p>

      <div class="flex items-center gap-2">
        <UBadge
          :color="severityColor"
          variant="soft"
          size="sm"
        >
          Missed Dose
        </UBadge>
      </div>
    </div>
  </div>
</template>
