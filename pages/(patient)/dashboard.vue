<script lang="ts" setup>
import QRCode from 'qrcode'

definePageMeta({ layout: 'simple' })

const { data: session } = useAuth()
</script>

<template>
  <Page icon="ic:twotone-shield" title="Mediguard" class="w-full max-w-6xl bg-elevated rounded-md">
    <template #headerExtra>
      <UButton
        to="/logout"
        class="ml-auto"
        size="lg"
        variant="ghost"
        color="primary"
        icon="ic:round-logout"
      >
        Logout
      </UButton>
    </template>

    <div class="w-full flex flex-col gap-2 text-default">
      <Card>
        <template #header>
          <h2 class="text-xl font-semibold">
            Welcome to Mediguard {{ session?.user.name || '' }}
          </h2>
        </template>
        <p class="text-sm">
          Mediguard is a secure and user-friendly platform designed to connect patients and caretakers
          seamlessly. Our mission is to enhance medication management and improve healthcare outcomes through accessible
          and efficient solutions.
        </p>
      </Card>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-default">
      <PatientDashboardNextDose />

      <PatientDashboardCaretakers />
    </div>
  </Page>
</template>
