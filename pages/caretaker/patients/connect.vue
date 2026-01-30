<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import { z } from 'zod'

// Schema for form validation
const connectSchema = z.object({
  id: z.string().min(1, 'Encrypted ID is required'),
}).transform((data, ctx) => {
  try {
    const { decryptIdWithFallback } = useCrypto()
    return decryptIdWithFallback(data.id)
  }
  catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: error instanceof Error ? error.message : 'Failed to decrypt patient ID',
    })
    return z.NEVER
  }
})

const { $trpc } = useNuxtApp()
const { data: session } = useAuth()

const isLoading = ref(false)
const hasError = ref(false)
const decryptionError = ref<string | null>(null)

// Parse the route query and handle decryption
const parseResult = computed(() => connectSchema.safeParse(useRoute().query))

const idToConnect = computed(() => {
  const result = parseResult.value
  return result.success ? result.data : null
})

// Watch for parsing errors
watch(parseResult, (result) => {
  if (!result.success) {
    const errorMessage = result.error.issues[0]?.message || 'Invalid encrypted ID'
    decryptionError.value = errorMessage
    hasError.value = true
  }
  else {
    decryptionError.value = null
    hasError.value = false
  }
}, { immediate: true })

const createRelation = useMutation({
  mutationFn: (input: { patientId: string, caretakerId: string }) => $trpc.caretakerRelation.create.mutate(input),
  mutationKey: ['caretakerRelation', 'create'],
  onError: () => {
    hasError.value = true
  },
  onSuccess: async () => {
    useToastMessage('success', 'Patient connected successfully')
    await setTimeout(() => {
      navigateTo('/caretaker/patients')
    }, 1000) // Brief delay to show success message
  },
  onSettled: () => {
    isLoading.value = false
  },
})

// Retry connection function
function retryConnection() {
  if (!idToConnect.value || createRelation.isPending.value) {
    return
  }

  hasError.value = false
  createRelation.reset()
  createRelation.mutateAsync({ patientId: idToConnect.value, caretakerId: session.value?.user.id ?? '' })
}

// Initial connection attempt - only if we have a valid ID and haven't attempted yet
watch(idToConnect, (id) => {
  if (id && !hasError.value && !createRelation.isPending.value) {
    createRelation.mutateAsync({ patientId: id, caretakerId: session.value?.user.id ?? '' })
  }
}, { immediate: true })
</script>

<template>
  <Page icon="i-heroicons-link" title="Connect Patient">
    <Card>
      <template #header>
        <h3 class="text-lg font-semibold">
          Patient Connection
        </h3>
      </template>

      <div class="flex flex-col items-center justify-center min-h-[200px] space-y-6">
        <div v-if="createRelation.isPending.value" class="text-center space-y-4">
          <div class="flex justify-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
          </div>
          <div class="space-y-2">
            <h4 class="text-lg font-medium text-default">
              Connecting to Patient
            </h4>
            <p class="text-sm text-muted">
              Please wait while we establish the connection...
            </p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="hasError || createRelation.isError.value" class="text-center space-y-4 max-w-md">
          <div class="flex justify-center">
            <UIcon name="i-heroicons-x-circle" class="w-12 h-12 text-error-400" />
          </div>
          <div class="space-y-2">
            <h4 class="text-lg font-medium text-error-400">
              Connection Failed
            </h4>
            <p class="text-sm text-error-400">
              {{ decryptionError || createRelation.error.value?.message || 'Unable to connect to the patient. Please check the encrypted ID and try again.' }}
            </p>
          </div>
          <div class="flex gap-3 justify-center">
            <UButton
              variant="outline"
              @click="navigateTo('/caretaker/patients')"
            >
              Go Back
            </UButton>
            <UButton
              :loading="createRelation.isPending.value"
              @click="retryConnection"
            >
              Try Again
            </UButton>
          </div>
        </div>

        <!-- Success State (brief display before navigation) -->
        <div v-else-if="createRelation.isSuccess.value" class="text-center space-y-4">
          <div class="flex justify-center">
            <UIcon name="i-heroicons-check-circle" class="w-12 h-12 text-success-400" />
          </div>
          <div class="space-y-2">
            <h4 class="text-lg font-medium text-success-400">
              Connected Successfully!
            </h4>
            <p class="text-sm text-success-400">
              Redirecting to patients list...
            </p>
          </div>
        </div>

        <!-- Initial State (should quickly transition to loading) -->
        <div v-else class="text-center space-y-4">
          <div class="flex justify-center">
            <UIcon name="i-heroicons-link" class="w-12 h-12 text-primary-500" />
          </div>
          <div class="space-y-2">
            <h4 class="text-lg font-medium text-default">
              Initializing Connection
            </h4>
            <p class="text-sm text-muted">
              Preparing to connect...
            </p>
          </div>
        </div>
      </div>
    </Card>
  </Page>
</template>
