<script setup lang="ts">
defineProps<{ icon: string, title: string }>()
</script>

<template>
  <div class="flex items-center justify-between p-4 bg-slate-800 rounded-md">
    <div class="flex items-center space-x-3">
      <UIcon :name="icon" class="w-9 h-9" />
      <h1 class="text-3xl font-semibold text-slate-300">
        {{ title }}
      </h1>
    </div>
    <slot name="headerExtra" />
  </div>
</template>
