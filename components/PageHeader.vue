<script setup lang="ts">
defineProps<{ icon: string, title: string }>()
</script>

<template>
  <div class="flex items-center justify-between p-4 bg-muted rounded-md border border-default shadow-sm">
    <div class="flex items-center space-x-3">
      <UIcon :name="icon" class="text-4xl text-primary" />
      <h1 class="text-3xl font-semibold text-highlighted">
        {{ title }}
      </h1>
    </div>
    <slot name="headerExtra" />
  </div>
</template>
