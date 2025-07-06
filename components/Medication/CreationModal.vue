<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createMedicationSchema, frequencySchema } from '~/schemas'
import type { FrequencyType } from '~/types'

const props = defineProps<{
  patientId: string
  patientName: string
}>()

const emit = defineEmits<{ close: [] }>()
const { $trpc } = useNuxtApp()
const queryClient = useQueryClient()

// Create options for the select dropdown
const frequencySelectOptions = frequencySchema.options.map(option => ({
  label: option,
  value: option
}))

// Form state for HTML inputs (using strings for dates)
interface MedicationFormData {
  name: string
  description: string
  dosage: string
  frequency: FrequencyType
  startDate: string
  endDate: string
  accountId: string
}

const defaultMedicationForm: MedicationFormData = {
  name: '',
  description: '',
  dosage: '',
  frequency: 'Once a day',
  startDate: '',
  endDate: '',
  accountId: props.patientId,
}

const medicationForm = ref<MedicationFormData>(defaultMedicationForm)

// Reset form
function resetMedicationForm() {
  medicationForm.value = defaultMedicationForm
}

watch(() => props.patientId, (newPatientId) => {
  medicationForm.value.accountId = newPatientId
})

const createMedication = useMutation({
  mutationFn: $trpc.medication.createMedication.mutate,
  mutationKey: ['medication', 'create'],
  onSuccess: () => {
    useToastMessage('success', 'Medication created successfully')
    resetMedicationForm()
    queryClient.invalidateQueries({ queryKey: ['medication'] })
    emit('close')
  },
  onError: (error) => {
    console.error('Failed to create medication:', error)
    useToastMessage('error', 'Failed to create medication')
  },
})

async function handleCreateMedication() {
  const formData = {
    ...medicationForm.value,
    startDate: medicationForm.value.startDate,
    endDate: medicationForm.value.endDate,
  }

  try {
    const validatedData = createMedicationSchema.parse(formData)
    createMedication.mutate(validatedData)
  }
  catch (error) {
    console.error('Validation error:', error)
    useToastMessage('error', 'Please check your form inputs')
  }
}

onMounted(() => resetMedicationForm)
</script>

<template>
  <UModal>
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="ic:round-medication" class="text-primary text-xl" />
              <h3 class="text-lg font-semibold">
                Add Medication
              </h3>
            </div>
            <UButton
              variant="ghost"
              icon="ic:round-close"
              @click="$emit('close')"
            />
          </div>
          <p class="text-sm text-muted mt-1">
            Creating medication for {{ patientName }}
          </p>
        </template>

        <form @submit.prevent="handleCreateMedication">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-default mb-1">Medication Name *</label>
              <UInput
                v-model="medicationForm.name"
                placeholder="Enter medication name"
                icon="ic:round-medication"
                class="w-full"
                required
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-default mb-1">Dosage *</label>
                <UInput
                  v-model="medicationForm.dosage"
                  placeholder="e.g., 10mg, 1 tablet"
                  icon="ic:round-scale"
                  class="w-full"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-default mb-1">Frequency *</label>
                <USelect
                  v-model="medicationForm.frequency"
                  :items="frequencySelectOptions"
                  placeholder="Select frequency"
                  icon="ic:round-schedule"
                  class="w-full"
                  required
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-default mb-1">Start Date *</label>
                <UInput
                  v-model="medicationForm.startDate"
                  type="date"
                  icon="ic:round-event"
                  class="w-full"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-default mb-1">End Date *</label>
                <UInput
                  v-model="medicationForm.endDate"
                  type="date"
                  icon="ic:round-event-available"
                  class="w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-default mb-1">Description</label>
              <UTextarea
                v-model="medicationForm.description"
                placeholder="Enter medication description or instructions"
                :rows="3"
                class="w-full"
              />
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <UButton
                variant="ghost"
                :disabled="createMedication.isPending.value"
                @click="$emit('close')"
              >
                Cancel
              </UButton>
              <UButton
                type="submit"
                :loading="createMedication.isPending.value"
              >
                {{ createMedication.isPending.value ? 'Creating...' : 'Create Medication' }}
              </UButton>
            </div>
          </div>
        </form>
      </UCard>
    </template>
  </UModal>
</template>
