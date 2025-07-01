<script lang="ts" setup>
definePageMeta({ layout: 'simple' })

const { data: session } = useAuth()
</script>

<template>
  <Page icon="ic:twotone-shield" title="Mediguard" class="w-full max-w-6xl bg-elevated rounded-md">
    <template #headerExtra>
      <UButton
        to="/logout"
        class="ml-auto"
        size="sm"
        variant="solid"
        color="neutral"
        icon="ic:round-logout"
      >
        Logout
      </UButton>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-default">
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
  </Page>
</template>
