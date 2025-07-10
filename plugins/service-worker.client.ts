export default defineNuxtPlugin(() => {
  // Only register service worker on client side
  if (import.meta.client && 'serviceWorker' in navigator) {
    // Register service worker after page load to avoid blocking
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // eslint-disable-next-line no-console
                console.log('New service worker installed, reloading page...')
                window.location.reload()
              }
            })
          }
        })
      }
      catch (error) {
        console.warn('Service worker registration failed:', error)
      }
    })
  }
})
