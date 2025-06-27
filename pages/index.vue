<script lang="ts" setup>
definePageMeta({ layout: 'simple' })

const { data: session } = useAuth()
if (session.value?.user.role === 'caretaker') {
  navigateTo('/caretaker/dashboard')
}
</script>

<template>
  <Page icon="ic:twotone-shield" title="Mediguard" class="w-full max-w-6xl bg-slate-700 rounded-md">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
      <UCard>
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
      </UCard>
    </div>
  </Page>
</template>
