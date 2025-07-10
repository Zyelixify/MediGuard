<script setup lang="ts">
import MedicationCreationModal from '~/components/Medication/CreationModal.vue'

const { data: session } = useAuth()

const { medication } = useQuery()
const { data: patientMedications, isLoading: medicationsLoading, isFetching, refetch } = medication.all({
  where: { accountId: session.value?.user.id }
})

const medications = computed(() => patientMedications.value || [])

// Handle refresh with loading state
const isRefreshing = ref(false)

async function handleRefresh() {
  isRefreshing.value = true
  try {
    await refetch()
  }
  finally {
    isRefreshing.value = false
  }
}

const overlay = useOverlay()
const medicationCreationModal = overlay.create(MedicationCreationModal)

function openMedicationCreationModal() {
  if (!session.value?.user) {
    console.error('No user session found')
    return
  }

  medicationCreationModal.open({ patientId: session.value.user.id, patientName: session.value?.user.name })
}
</script>

<template>
  <Card class="w-full">
    <template #header>
      <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
        <UIcon name="ic:round-medication" class="text-primary text-lg sm:text-xl flex-shrink-0" />
        <h2 class="text-base sm:text-xl font-semibold text-default">
          My Medications
        </h2>
        <ClientOnly>
          <UBadge v-if="medications.length > 0" variant="soft" color="primary" size="sm" class="sm:size-md">
            {{ medications.length }}
          </UBadge>
        </ClientOnly>
      </div>
    </template>

    <template #headerExtra>
      <div class="flex items-center gap-1 sm:gap-2">
        <UTooltip text="Refresh medications">
          <UButton
            size="sm"
            variant="outline"
            color="neutral"
            icon="ic:round-refresh"
            :loading="isRefreshing || isFetching"
            :disabled="isRefreshing || medicationsLoading || isFetching"
            @click="handleRefresh"
          />
        </UTooltip>
        <UButton
          size="sm"
          variant="outline"
          color="primary"
          icon="ic:round-add"
          @click="openMedicationCreationModal"
        >
          Add Medication
        </UButton>
      </div>
    </template>

    <ClientOnly>
      <div v-if="medicationsLoading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
        <span class="ml-2 text-sm text-muted">Loading medications...</span>
      </div>

      <div v-else-if="medications.length === 0" class="flex flex-col items-center justify-center py-8 space-y-2">
        <UIcon name="ic:round-medication" class="text-muted text-4xl" />
        <p class="text-sm text-muted">
          No medications found
        </p>
      </div>

      <div v-else>
        <MedicationCarousel :medications="medications" />
      </div>

      <template #fallback>
        <div class="flex items-center justify-center py-8">
          <UIcon name="ic:round-medication" class="text-muted text-4xl" />
        </div>
      </template>
    </ClientOnly>
  </Card>
</template>
