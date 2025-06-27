<script setup lang="ts">
definePageMeta({ layout: 'unauthenticated', })

const { signOut } = useAuth()
setTimeout(signOut, 1000)
</script>

<template>
  <div class="flex flex-col justify-center items-center mb-6 text-slate-300">
    <h1 class="text-2xl font-semibold mb-4">
      You have been logged out
    </h1>
    <p>See you soon!</p>
  </div>
</template>
