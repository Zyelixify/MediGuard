<script setup lang="ts">
interface Props {
  event: any
  showFullDateTime?: boolean
  variant?: 'card' | 'modal'
}

withDefaults(defineProps<Props>(), {
  showFullDateTime: false,
  variant: 'card'
})

const {
  formatTimeUntil,
  formatTime12Hour,
  formatFullDateTime
} = useDateFormatting()

const {
  getEventIcon,
  getEventColor,
  formatEventType,
} = useEventHelpers()
</script>

<template>
  <div
    class="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-elevated rounded-lg border border-default"
    :class="{
      'hover:border-primary/50 transition-colors': variant === 'card',
      'mr-1': variant === 'modal',
    }"
  >
    <!-- Icon Section -->
    <div class="flex-shrink-0 mt-0.5">
      <div
        class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
        :class="`bg-${getEventColor(event.type)}/10`"
      >
        <UIcon
          :name="getEventIcon(event.type)"
          class="text-xs sm:text-sm"
          :class="`text-${getEventColor(event.type)}`"
        />
      </div>
    </div>

    <!-- Content Section -->
    <div class="flex-1 min-w-0">
      <!-- Mobile: Stack vertically, Desktop: Side by side -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-0">
        <!-- Main Content -->
        <div class="flex-1 min-w-0 space-y-1">
          <p class="text-sm font-medium text-default leading-snug">
            {{ event.message }}
          </p>

          <!-- Time Info -->
          <div class="flex items-center gap-1.5 text-xs text-muted">
            <UIcon name="ic:round-access-time" class="text-xs flex-shrink-0" />
            <div class="flex flex-wrap items-center gap-1">
              <template v-if="showFullDateTime">
                <span class="whitespace-nowrap">{{ formatFullDateTime(event.timestamp) }}</span>
              </template>
              <template v-else>
                <span class="whitespace-nowrap">{{ formatTimeUntil(event.timestamp, false) }}</span>
                <span class="text-muted/70">•</span>
                <span class="whitespace-nowrap">{{ formatTime12Hour(event.timestamp) }}</span>
              </template>
            </div>
          </div>
        </div>

        <!-- Badge - On mobile: below content, on desktop: aligned to top -->
        <div class="flex-shrink-0 self-start mt-0.5 sm:mt-0">
          <UBadge
            :color="getEventColor(event.type)"
            variant="soft"
            size="xs"
            class="text-xs"
          >
            {{ formatEventType(event.type) }}
          </UBadge>
        </div>
      </div>
    </div>
  </div>
</template>
