<script setup lang="ts">
defineProps<{ collapsed?: boolean }>()
</script>

<template>
  <h2
    class="block text-4xl align-baseline text-center select-none text-primary"
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
