<script setup lang="ts">
const { data: session } = useAuth()

const { event } = useQuery()
const { data: eventsData, isLoading, isFetching, refetch } = event.all({
  where: { accounts: { some: { id: session.value?.user.id } } },
  orderBy: { timestamp: 'desc' }
})
const allEvents = computed(() => eventsData.value || [])
const recentEvents = computed(() => allEvents.value.slice(0, 3))

const isRefreshing = computed(() => isFetching.value && !isLoading.value)

defineExpose({
  unreadCount: computed(() => recentEvents.value.length || 0)
})
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
        <UIcon name="ic:round-history" class="text-primary text-lg sm:text-xl flex-shrink-0" />
        <h2 class="text-base sm:text-xl font-semibold text-default">
          Recent Activity
        </h2>
        <UBadge v-if="recentEvents.length > 0" variant="soft" color="primary" size="sm" class="sm:size-md">
          {{ recentEvents.length }}
        </UBadge>
      </div>
    </template>

    <template #headerExtra>
      <div class="flex items-center gap-1 sm:gap-2">
        <UTooltip text="Refresh activity">
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

        <UModal v-if="recentEvents.length > 0">
          <UButton
            size="sm"
            variant="outline"
            color="primary"
            icon="ic:round-history"
          >
            View All
          </UButton>
          <template #content>
            <div class="p-6 max-w-2xl ">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-2">
                  <UIcon name="ic:round-history" class="text-primary text-xl" />
                  <h3 class="text-xl font-semibold text-default">
                    Activity History
                  </h3>
                </div>
              </div>

              <div v-if="isLoading" class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
                <span class="ml-2 text-sm text-muted">Loading history...</span>
              </div>

              <div v-else-if="allEvents.length === 0" class="text-center py-8">
                <UIcon name="ic:round-history" class="text-muted text-4xl mx-auto mb-2" />
                <p class="text-sm text-muted">
                  No events found
                </p>
              </div>

              <div v-else class="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                <DashboardEventItem
                  v-for="historyEvent in allEvents"
                  :key="historyEvent.id"
                  :event="historyEvent"
                  :show-full-date-time="true"
                  variant="modal"
                />

                <div v-if="allEvents.length >= 50" class="text-center pt-4">
                  <p class="text-xs text-muted">
                    Showing recent 50 events
                  </p>
                </div>
              </div>
            </div>
          </template>
        </UModal>
      </div>
    </template>

    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
      <span class="ml-2 text-sm text-muted">Loading recent activity...</span>
    </div>

    <div v-else-if="recentEvents.length === 0" class="flex flex-col items-center justify-center py-8 space-y-3">
      <UIcon name="ic:round-history" class="text-muted text-4xl" />
      <div class="space-y-1 text-center">
        <p class="text-sm font-medium text-default">
          No recent activity
        </p>
        <p class="text-xs text-muted">
          Your recent events will appear here
        </p>
      </div>
    </div>

    <div v-else class="space-y-4">
      <DashboardEventItem
        v-for="eventItem in recentEvents"
        :key="eventItem.id"
        :event="eventItem"
        variant="card"
      />
    </div>
  </Card>
</template>
