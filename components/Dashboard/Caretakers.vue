<script lang="ts" setup>
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import QRCode from 'qrcode'

const { data: session } = useAuth()
const { encryptId } = useCrypto()

const encryptedPatientId = computed(() => {
  if (!session.value?.user.id) {
    return ''
  }
  return encryptId(session.value.user.id)
})

const qrCodeUrl = computed(() => {
  if (!encryptedPatientId.value) {
    return ''
  }
  const baseUrl = process.client ? window.location.origin : 'http://localhost:3000'
  return `${baseUrl}/caretaker/patients/connect?id=${encryptedPatientId.value}`
})

const qrCodeDataUrl = ref('')

watch(qrCodeUrl, async (url) => {
  if (url) {
    try {
      qrCodeDataUrl.value = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: { dark: '#2E3440', light: '#ECEFF4', },
      })
    }
    catch (error) {
      console.error('Failed to generate QR code:', error)
      useToastMessage('error', `Failed to generate QR code`)
    }
  }
}, { immediate: true })

// Copy link function
async function copyLinkToClipboard() {
  if (!qrCodeUrl.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(qrCodeUrl.value)
    useToastMessage('success', 'Connection link copied to clipboard!')
  }
  catch (error) {
    console.error('Failed to copy to clipboard:', error)
    useToastMessage('error', 'Failed to copy link to clipboard')
  }
}

// Download QR code function
function downloadQRCode() {
  if (!qrCodeDataUrl.value) {
    return
  }

  try {
    const link = document.createElement('a')
    link.href = qrCodeDataUrl.value
    link.download = `mediguard-caretaker-qr-${new Date().toISOString().split('T')[0]}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    useToastMessage('success', 'QR code downloaded!')
  }
  catch (error) {
    console.error('Failed to download QR code:', error)
    useToastMessage('error', 'Failed to download QR code')
  }
}

const { caretakerRelation } = useQuery()
const { data: caretakersData, isLoading, refetch, isFetching } = caretakerRelation.all({ where: { patientId: session.value?.user.id } })
const caretakers = computed(() => caretakersData.value || [])

// Track refresh loading state separately from initial loading
const isRefreshing = computed(() => isFetching.value && !isLoading.value)

const { $trpc } = useNuxtApp()
const queryClient = useQueryClient()
const deleteRelation = useMutation({
  mutationFn: $trpc.caretakerRelation.delete.mutate,
  mutationKey: ['caretakerRelation', 'delete'],
  onSuccess: () => {
    useToastMessage('success', 'Caretaker removed successfully')
    queryClient.invalidateQueries({ queryKey: ['caretakerRelation', 'all'] })
  },
  onError: (error) => {
    console.error('Failed to remove caretaker:', error)
    useToastMessage('error', 'Failed to remove caretaker')
  },
})

const confirmRelation = useMutation({
  mutationFn: $trpc.caretakerRelation.confirm.mutate,
  mutationKey: ['caretakerRelation', 'confirm'],
  onSuccess: () => {
    useToastMessage('success', 'Caretaker confirmed successfully')
    queryClient.invalidateQueries({ queryKey: ['caretakerRelation', 'all'] })
  },
  onError: (error) => {
    console.error('Failed to confirm caretaker:', error)
    useToastMessage('error', 'Failed to confirm caretaker')
  },
})

// Handle caretaker deletion with confirmation
async function handleDeleteCaretaker(caretaker: any) {
  // eslint-disable-next-line no-alert
  const confirmed = window.confirm(`Are you sure you want to remove ${caretaker.caretaker.name} as your caretaker? This action cannot be undone.`)

  if (confirmed) {
    deleteRelation.mutateAsync({ id: caretaker.id })
  }
}
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
        <UIcon name="ic:round-people" class="text-primary text-lg sm:text-xl flex-shrink-0" />
        <h2 class="text-base sm:text-xl font-semibold text-default">
          My Caretakers
        </h2>
        <UBadge v-if="caretakers.length > 0" variant="soft" color="primary" size="sm" class="sm:size-md">
          {{ caretakers.length }}
        </UBadge>
      </div>
    </template>

    <template #headerExtra>
      <div class="flex items-center gap-1 sm:gap-2">
        <UTooltip text="Refresh caretaker list">
          <UButton
            size="sm"
            variant="outline"
            color="neutral"
            icon="ic:round-refresh"
            :loading="isRefreshing"
            :disabled="isRefreshing || isLoading"
            @click="refetch()"
          />
        </UTooltip>
        <UModal>
          <UButton
            class="ml-auto"
            size="sm"
            variant="outline"
            color="primary"
            icon="ic:round-add"
          >
            Add Caretaker
          </UButton>

          <template #content>
            <div class="w-full max-w-lg p-6">
              <div class="text-center space-y-6">
                <div class="space-y-2">
                  <UIcon name="ic:baseline-qr-code" class="mx-auto text-primary text-4xl" />
                  <h3 class="text-xl font-semibold text-default">
                    Add a Caretaker
                  </h3>
                  <p class="text-sm text-muted">
                    Share this QR code or link with your caretaker to connect with them securely.
                  </p>
                </div>

                <div class="flex justify-center">
                  <div v-if="qrCodeDataUrl" class="p-2 bg-nord-polar-100 rounded-lg shadow-sm border">
                    <img
                      :src="qrCodeDataUrl"
                      alt="QR Code for caretaker connection"
                      class="max-w-full h-auto"
                    >
                  </div>
                  <div v-else class="p-8 bg-nord-polar-100 rounded-lg shadow-sm border">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto" />
                    <p class="text-sm text-muted mt-2">
                      Generating QR code...
                    </p>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="p-3 bg-elevated rounded-lg">
                    <p class="text-xs font-medium text-muted mb-1 select-none">
                      Connection Link:
                    </p>
                    <code class="text-xs text-default break-all">{{ qrCodeUrl }}</code>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                    <UButton
                      variant="outline"
                      icon="ic:round-content-copy"
                      :disabled="!qrCodeUrl"
                      @click="copyLinkToClipboard"
                    >
                      Copy Link
                    </UButton>

                    <UButton
                      v-if="qrCodeDataUrl"
                      variant="outline"
                      icon="ic:round-download"
                      @click="downloadQRCode"
                    >
                      Download QR
                    </UButton>
                  </div>

                  <div class="text-xs text-muted">
                    For security reasons, the QR code and link are valid for only 1 day.
                  </div>
                </div>
              </div>
            </div>
          </template>
        </UModal>
      </div>
    </template>

    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
    </div>

    <div v-else-if="caretakers.length === 0" class="text-center py-8 space-y-3">
      <UIcon name="ic:round-people-outline" class="text-muted text-4xl mx-auto" />
      <div class="space-y-1">
        <p class="text-sm font-medium text-default">
          No caretakers connected
        </p>
        <p class="text-xs text-muted">
          Share your QR code to connect with caretakers securely
        </p>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div v-for="caretaker in caretakers" :key="caretaker.id" class="flex items-center justify-between p-4 bg-elevated rounded-lg shadow-sm border border-default hover:border-primary transition-colors">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <UIcon name="ic:round-person" class="text-primary text-lg" />
          </div>
          <div class="flex-1 gap-2">
            <div class="flex items-center gap-2">
              <h3 class="text-md font-semibold text-default">
                {{ caretaker.caretaker.name }}
              </h3>
              <UBadge
                :color="caretaker.isConfirmed ? 'success' : 'warning'"
                variant="soft"
                size="md"
              >
                {{ caretaker.isConfirmed ? 'Confirmed' : 'Pending' }}
              </UBadge>
            </div>

            <p class="text-xs text-muted">
              {{ caretaker.caretaker.email }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <UTooltip v-if="!caretaker.isConfirmed" text="Cofirm Caretaker">
            <UButton
              variant="ghost"
              color="success"
              icon="ic:round-check-circle"
              size="sm"
              :loading="confirmRelation.isPending.value"
              @click="confirmRelation.mutateAsync({ id: caretaker.id })"
            />
          </UTooltip>

          <UTooltip text="Remove Caretaker">
            <UButton
              variant="ghost"
              color="error"
              icon="ic:round-delete"
              size="sm"
              :loading="deleteRelation.isPending.value"
              @click="() => handleDeleteCaretaker(caretaker)"
            />
          </UTooltip>
        </div>
      </div>
    </div>
  </Card>
</template>
