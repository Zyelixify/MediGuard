<script setup lang="ts">
import type { CaretakerRelationGetMany } from '~/types'

interface Props {
  patient: CaretakerRelationGetMany['patient']
}

const props = defineProps<Props>()

const { medication } = useQuery()

// Reactive query for patient medications
const { data: patientMedications, isLoading, error } = medication.all({
  where: { accountId: props.patient.id }
})

const medications = computed(() => patientMedications.value || [])
</script>

<template>
  <div class="p-2 bg-elevated/25 border-t border-gray-200 dark:border-gray-700">
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
      <span class="ml-2 text-sm text-muted">Loading medications...</span>
    </div>

    <div v-else-if="error" class="flex items-center justify-center py-8">
      <UIcon name="ic:round-error" class="text-error text-xl mr-2" />
      <span class="text-sm text-error">Failed to load medications</span>
    </div>

    <div v-else-if="medications.length === 0" class="flex flex-col items-center justify-center py-8 space-y-2">
      <UIcon name="ic:round-medication" class="text-muted text-2xl" />
      <p class="text-sm text-muted">
        No medications found for this patient
      </p>
    </div>

    <div v-else>
      <MedicationCarousel :medications="medications" />
    </div>
  </div>
</template>
