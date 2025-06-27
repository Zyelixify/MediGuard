<script setup lang="ts">
defineProps<{ collapsed?: boolean }>()
</script>

<template>
  <h2
    class="block text-4xl align-baseline text-center text-slate-300 select-none"
    :style="{
      height: '100%',
      transition: '0.3s',
      width: 300,
      transform: 'scale(1)',
      fontFamily: 'Roboto',
    }"
  >
    {{ collapsed ? 'MG' : 'Mediguard' }}
  </h2>
</template>
