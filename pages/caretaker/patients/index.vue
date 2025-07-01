<script lang="ts" setup>
const isAddPatientPopupOpen = ref(false)
</script>

<template>
  <Page title="Patients" icon="ic:baseline-people">
    <template #headerExtra>
      <UModal>
        <UButton
          class="ml-auto"
          size="sm"
          variant="solid"
          color="primary"
          icon="ic:round-add"
          @click="isAddPatientPopupOpen = true"
        >
          Add Patient
        </UButton>

        <template #content>
          <div class="w-full max-w-lg p-4 items-center">
            <p class="flex gap-2 items-center text-lg mb-4">
              <UIcon name="ic:baseline-info" class="inline-block mr-2 text-primary text-2xl" />
              Adding a patient
            </p>
            To add a patient, follow the following steps:
            <ol class="list-decimal pl-6 mb-4">
              <li>The patient must open the "Register Caretaker" popup in their dashboard.</li>
              <li>A QR code and link is then displayed. Using this link and QR code you can register a patient in your care.</li>
            </ol>
            Please note that the QR code and link are only valid <span class="font-semibold">for 1 day</span>.
          </div>
        </template>
      </UModal>
    </template>

    <div class="flex flex-col gap-4">
      <PatientsTable />
    </div>
  </Page>
</template>
