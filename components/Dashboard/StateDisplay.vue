<script setup lang="ts">
interface Props {
  type?: 'error' | 'empty' | 'success'
  title: string
  message?: string
  icon?: string
  showRetry?: boolean
  isRetrying?: boolean
  retryText?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'error',
  showRetry: false,
  isRetrying: false,
  retryText: 'Retry'
})

defineEmits<{
  retry: []
}>()

const icon = computed(() => {
  if (props.icon) {
    return props.icon
  }

  switch (props.type) {
    case 'empty':
      return 'ic:round-inbox'
    case 'success':
      return 'ic:round-check-circle'
    case 'error':
    default:
      return 'ic:round-error'
  }
})

const iconColorClass = computed(() => {
  switch (props.type) {
    case 'empty':
      return 'text-muted'
    case 'success':
      return 'text-success'
    case 'error':
    default:
      return 'text-error'
  }
})

const retryColor = computed(() => {
  switch (props.type) {
    case 'error':
      return 'error'
    default:
      return 'primary'
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-8 space-y-3">
    <UIcon :name="icon" :class="iconColorClass" class="text-4xl" />
    <div class="space-y-1 text-center">
      <p class="text-sm font-medium text-default">
        {{ title }}
      </p>
      <p v-if="message" class="text-xs text-muted">
        {{ message }}
      </p>
    </div>
    <UButton
      v-if="showRetry"
      size="sm"
      variant="outline"
      :color="retryColor"
      :loading="isRetrying"
      @click="$emit('retry')"
    >
      {{ retryText }}
    </UButton>
  </div>
</template>
