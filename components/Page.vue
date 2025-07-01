<script setup lang="ts">
defineProps<{ icon: string, title: string }>()
</script>

<template>
  <div class="p-4 md:px-8 md:py-4 flex flex-col gap-5 h-screen bg-default rounded-lg shadow">
    <PageHeader :icon="icon" :title="title">
      <template #headerExtra>
        <slot name="headerExtra" />
      </template>
    </PageHeader>
    <slot />
  </div>
</template>
