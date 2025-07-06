<script lang="ts" setup>
definePageMeta({ layout: 'simple' })
</script>

<template>
  <Page icon="ic:twotone-shield" title="Mediguard" class="w-full max-w-6xl bg-elevated rounded-md">
    <template #headerExtra>
      <div class="flex items-center gap-2">
        <UButton
          to="/logout"
          size="lg"
          variant="ghost"
          color="primary"
          icon="ic:round-logout"
        >
          Logout
        </UButton>
      </div>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-default">
      <DashboardNextDose />

      <DashboardEventCard />
    </div>

    <div class="w-full flex flex-col gap-2 text-default">
      <DashboardMedications />

      <DashboardCaretakers />
    </div>
  </Page>
</template>
