<script setup lang="ts">
definePageMeta({ layout: 'simple' })

const { signOut } = useAuth()
signOut()
</script>

<template>
  <div class="flex flex-col justify-center items-center mb-6 text-slate-300">
    <h1 class="text-2xl font-semibold mb-4">
      You are being logged out...
    </h1>
    <p>See you soon!</p>
  </div>
</template>
