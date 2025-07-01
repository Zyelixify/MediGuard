export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware for auth pages and API routes
  if (to.path.startsWith('/login') || to.path.startsWith('/logout') || to.path.startsWith('/api')) {
    return
  }

  const { data: session, status } = useAuth()

  // Wait for auth to load
  if (status.value === 'loading') {
    return
  }

  // If not authenticated, redirect to login
  if (status.value === 'unauthenticated') {
    return navigateTo('/login')
  }

  const role = session.value?.user?.role

  // If authenticated but no role, redirect to login
  if (!role) {
    return navigateTo('/login')
  }

  if (role === 'caretaker' && ['/', '/dashboard'].includes(to.path)) {
    return navigateTo('/caretaker/dashboard')
  }

  if (role === 'user' && (to.path === '/' || to.path.startsWith('/caretaker'))) {
    return navigateTo('/dashboard')
  }
})
