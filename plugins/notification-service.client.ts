export default defineNuxtPlugin(() => {
  // Initialize notification service on the client side only
  if (import.meta.client) {
    // Use nextTick to ensure all composables are available
    nextTick(() => {
      // Only initialize if user is authenticated
      const { data: session } = useAuth()

      watch(session, (newSession) => {
        if (newSession?.user) {
          // Initialize notification service when user is logged in
          const { initializeService } = useNotifications()
          initializeService()
        }
      }, { immediate: true })
    })
  }
})
