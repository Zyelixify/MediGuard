<script setup lang="ts">
interface Props {
  patientId: string
}

const props = defineProps<Props>()

const { medication } = useQuery()
const { data: medicationsData, isLoading } = medication.all({ 
  where: { accountId: props.patientId },
  include: { scheduledMedications: true }
})

const medications = computed(() => medicationsData.value || [])
</script>

<template>
  <div>
    <div v-if="isLoading" class="flex items-center justify-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500" />
      <span class="ml-3 text-sm text-muted">Loading medications...</span>
    </div>
    
    <div v-else-if="medications.length === 0" class="flex flex-col items-center justify-center py-8 space-y-2">
      <UIcon name="ic:round-medication" class="text-muted text-2xl" />
      <p class="text-sm text-muted">No medications found</p>
    </div>
    
    <MedicationCarousel v-else :medications="medications" />
  </div>
</template>
