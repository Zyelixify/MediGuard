<script setup lang="ts">
interface Props {
  text?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-4 w-4'
    case 'lg':
      return 'h-8 w-8'
    case 'md':
    default:
      return 'h-6 w-6'
  }
})
</script>

<template>
  <div class="flex items-center justify-center py-8">
    <div
      class="animate-spin rounded-full border-b-2 border-primary-500"
      :class="sizeClasses"
    />
    <span v-if="text" class="ml-2 text-sm text-muted">{{ text }}</span>
  </div>
</template>
