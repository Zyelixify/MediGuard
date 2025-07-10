/* eslint-disable no-console */

// Service Worker for handling notifications
globalThis.addEventListener('install', () => {
  console.log('MediGuard Service Worker installed')
  globalThis.skipWaiting()
})

globalThis.addEventListener('activate', (event) => {
  console.log('MediGuard Service Worker activated')
  event.waitUntil(globalThis.clients.claim())
})

// Handle notification display requests from the main thread
globalThis.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data.payload

    // Show notification using Service Worker registration
    globalThis.registration.showNotification(title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      badge: '/favicon.ico',
      data: {
        url: options.url || '/',
        timestamp: Date.now(),
      },
      actions: options.actions || [],
    })
  }
})

// Handle notification clicks
globalThis.addEventListener('notificationclick', (event) => {
  event.notification.close()

  // Focus or open the app when notification is clicked
  event.waitUntil(
    globalThis.clients.matchAll().then((clients) => {
      const client = clients.find(c => c.visibilityState === 'visible')

      if (client) {
        client.focus()
      }
      else {
        globalThis.clients.openWindow(event.notification.data?.url || '/')
      }
    }),
  )
})

// Handle notification close events
globalThis.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag)
})
