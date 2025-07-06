<script lang="ts" setup>
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})
</script>

<template>
  <Page title="Caretaker Dashboard" icon="ic:baseline-dashboard">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-default">
      <!-- Placeholder for half-width cards -->
    </div>

    <div class="w-full flex flex-col gap-2 text-default">
      <DashboardMissedDoseCard />

      <DashboardPatients />

      <DashboardEventCard />
    </div>
  </Page>
</template>
