<script lang="ts" setup>
const { data: session } = useAuth()

if (session.value?.user.role === 'user') {
  navigateTo('/')
}
</script>

<template>
  <CaretakerDashboard />
</template>
