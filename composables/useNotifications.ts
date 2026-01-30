export type NotificationPermission = 'default' | 'granted' | 'denied'

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  requireInteraction?: boolean
  silent?: boolean
}

export interface NotificationEvent {
  type: 'dose' | 'overdue'
  medicationName: string
  timestamp: Date
}

// Global state
const notificationPermission = ref<NotificationPermission>('default')
const isSupported = ref(false)
const isEnabled = ref(false)
const isInitialized = ref(false)
const lastNotificationTime = ref<Date | null>(null)
const notificationInterval = ref<NodeJS.Timeout | null>(null)
const notifiedDoses = ref(new Set<string>())

// Service Worker state
const serviceWorkerRegistration = ref<ServiceWorkerRegistration | null>(null)
const isServiceWorkerSupported = ref(false)
const useServiceWorker = ref(false)

// Audio and animation state
const isAppVisible = ref(true)
const audioElement = ref<HTMLAudioElement | null>(null)
const isChimeEnabled = ref(true)
const lastNotificationEvent = ref<NotificationEvent | null>(null)
const notificationAnimation = ref(false)

// Text-to-Speech state
const isTTSSupported = ref(false)
const isTTSEnabled = ref(true)
const selectedVoice = ref<SpeechSynthesisVoice | null>(null)
const isSpeaking = ref(false)
const ttsInstance = ref<SpeechSynthesis | null>(null)

export default function useNotifications() {
  const { scheduledMedication } = useQuery()
  const { data: nextDose } = scheduledMedication.nextDose()

  // Initialize audio element
  const initializeAudio = () => {
    if (typeof window !== 'undefined' && !audioElement.value) {
      audioElement.value = new Audio('/notification-chime.mp3')
      audioElement.value.preload = 'auto'
      audioElement.value.volume = 0.8

      audioElement.value.addEventListener('error', () => {
        console.warn('Notification chime audio failed to load')
        isChimeEnabled.value = false
      })
    }
  }

  const initializeTTS = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      isTTSSupported.value = true
      ttsInstance.value = window.speechSynthesis

      const loadVoices = () => {
        const voices = speechSynthesis.getVoices()

        if (voices.length > 0 && !selectedVoice.value) {
          // Prefer en-US voices first
          const enUSVoiceWithFallback = voices.find(voice =>
            voice.lang === 'en-US' && voice.localService
          ) || voices.find(voice =>
            voice.lang === 'en-US'
          ) || voices.find(voice =>
            voice.lang.startsWith('en-') && voice.localService
          ) || voices.find(voice =>
            voice.lang.startsWith('en-')
          ) || voices[0]

          selectedVoice.value = enUSVoiceWithFallback
        }
      }

      loadVoices()
      speechSynthesis.addEventListener('voiceschanged', loadVoices)
    }
    else {
      isTTSSupported.value = false
      console.warn('Text-to-Speech is not supported in this browser')
    }
  }

  const speak = async (text: string, priority: 'high' | 'normal' = 'normal'): Promise<boolean> => {
    if (!isTTSSupported.value || !isTTSEnabled.value || !ttsInstance.value) {
      return false
    }

    try {
      if (priority === 'high' && isSpeaking.value) {
        ttsInstance.value.cancel()
      }

      if (isSpeaking.value && priority === 'normal') {
        return false
      }

      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text)

        if (selectedVoice.value) {
          utterance.voice = selectedVoice.value
        }
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 0.8

        utterance.addEventListener('start', () => {
          isSpeaking.value = true
        })

        utterance.addEventListener('end', () => {
          isSpeaking.value = false
          resolve(true)
        })

        utterance.addEventListener('error', (error) => {
          console.warn('TTS error:', error)
          isSpeaking.value = false
          resolve(false)
        })

        if (ttsInstance.value) {
          ttsInstance.value.speak(utterance)
        }
      })
    }
    catch (error) {
      console.error('Failed to speak text:', error)
      isSpeaking.value = false
      return false
    }
  }

  const stopSpeaking = () => {
    if (ttsInstance.value && isSpeaking.value) {
      ttsInstance.value.cancel()
      isSpeaking.value = false
    }
  }

  // Generate TTS message for notifications
  const generateTTSMessage = (type: 'dose' | 'overdue', medicationName: string, dosage?: string, overdueTime?: string): string => {
    if (type === 'dose') {
      return `Medication reminder: It's time to take your ${medicationName}${dosage ? ` ${dosage}` : ''}.`
    }
    else {
      return `Overdue medication alert: Your ${medicationName}${dosage ? ` ${dosage}` : ''} is overdue${overdueTime ? ` by ${overdueTime}` : ''}.`
    }
  }

  // Setup app visibility detection
  const setupVisibilityDetection = () => {
    if (typeof window !== 'undefined') {
      const handleVisibilityChange = () => {
        isAppVisible.value = !document.hidden
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      // Also track focus/blur events
      window.addEventListener('focus', () => {
        isAppVisible.value = true
      })
      window.addEventListener('blur', () => {
        isAppVisible.value = false
      })
    }
  }

  // Play notification chime
  const playChime = async () => {
    if (!isChimeEnabled.value || !audioElement.value) {
      return
    }

    try {
      // Reset audio to beginning
      audioElement.value.currentTime = 0
      await audioElement.value.play()
    }
    catch (error) {
      console.warn('Failed to play notification chime:', error)
    }
  }

  // Trigger notification animation
  const triggerAnimation = () => {
    notificationAnimation.value = true
    setTimeout(() => {
      notificationAnimation.value = false
    }, 2000)
  }

  // Create notification event
  const createNotificationEvent = (type: 'dose' | 'overdue', medicationName: string): NotificationEvent => {
    return {
      timestamp: new Date(),
      type,
      medicationName
    }
  }

  const checkSupport = () => {
    if (typeof window !== 'undefined') {
      // Check for Notification API support
      const hasNotificationAPI = 'Notification' in window

      // Check for Service Worker support (better for mobile)
      const hasServiceWorker = 'serviceWorker' in navigator

      // Support notifications if either API is available
      isSupported.value = hasNotificationAPI || hasServiceWorker

      if (hasNotificationAPI) {
        notificationPermission.value = Notification.permission as NotificationPermission
        isEnabled.value = notificationPermission.value === 'granted'
      }
      else {
        // For Service Worker only, we still need notification permission
        notificationPermission.value = 'default'
        isEnabled.value = false
      }
    }
    else {
      isSupported.value = false
      isEnabled.value = false
    }
  }

  // Initialize Service Worker for notifications
  const initializeServiceWorker = async () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        isServiceWorkerSupported.value = true

        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        serviceWorkerRegistration.value = registration

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready

        // Prefer Service Worker for notifications if supported
        useServiceWorker.value = true
      }
      catch (error) {
        console.warn('Service Worker registration failed, falling back to direct notifications:', error)
        useServiceWorker.value = false
      }
    }
    else {
      isServiceWorkerSupported.value = false
      useServiceWorker.value = false
      console.warn('Service Worker not supported, using direct notifications')
    }
  }

  // Check if current dose is overdue
  const isOverdue = computed(() => {
    if (!nextDose.value) {
      return false
    }
    const now = new Date()
    const scheduledTime = new Date(nextDose.value.scheduledAt)
    return now > scheduledTime
  })

  // Get how long the dose has been overdue
  const overdueTime = computed(() => {
    if (!nextDose.value || !isOverdue.value) {
      return ''
    }

    const now = new Date()
    const scheduledTime = new Date(nextDose.value.scheduledAt)
    const diffMs = now.getTime() - scheduledTime.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`
    }
    else {
      const diffHours = Math.floor(diffMinutes / 60)
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`
    }
  })

  // Check if we should notify for the current dose
  const shouldNotify = computed(() => {
    if (!nextDose.value || !isEnabled.value) {
      return false
    }

    const now = new Date()
    const scheduledTime = new Date(nextDose.value.scheduledAt)
    const timeDiff = scheduledTime.getTime() - now.getTime()

    // Notify if dose time has arrived (within 1 minute tolerance)
    return timeDiff <= 60000 && timeDiff >= 0
  })

  // Show a system notification (Service Worker or direct)
  const showNotification = async (options: NotificationOptions): Promise<Notification | null> => {
    if (!isEnabled.value) {
      console.warn('Notifications are not enabled or permission was denied')
      return null
    }

    try {
      const shouldMuteSystem = isAppVisible.value && isChimeEnabled.value

      // Try Service Worker notifications first (better mobile support)
      if (useServiceWorker.value && serviceWorkerRegistration.value) {
        try {
          // Use the registration directly to show notification
          await serviceWorkerRegistration.value.showNotification(options.title, {
            body: options.body,
            icon: options.icon || '/favicon.ico',
            tag: options.tag,
            requireInteraction: options.requireInteraction || false,
            silent: shouldMuteSystem || options.silent || false,
            badge: '/favicon.ico',
            data: {
              url: '/',
              timestamp: Date.now()
            }
          })

          // If app is visible and chime is enabled, play our custom chime
          if (shouldMuteSystem) {
            await playChime()
          }

          // Always trigger the visual animation when notifications are sent
          triggerAnimation()

          // Return a mock notification object for compatibility
          return { close: () => {} } as Notification
        }
        catch (swError) {
          console.warn('Service Worker notification failed, falling back to direct API:', swError)
          // Fall through to direct API
        }
      }

      // Fallback to direct Notification API
      if ('Notification' in window) {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/favicon.ico',
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
          silent: shouldMuteSystem || options.silent || false
        })

        // If app is visible and chime is enabled, play our custom chime
        if (shouldMuteSystem) {
          await playChime()
        }

        // Always trigger the visual animation when notifications are sent
        triggerAnimation()

        // Auto-close notification after 8 seconds if not requiring interaction
        if (!options.requireInteraction) {
          setTimeout(() => {
            notification.close()
          }, 8000)
        }

        return notification
      }

      throw new Error('No notification method available')
    }
    catch (error) {
      console.error('Failed to show notification:', error)
      return null
    }
  }

  const showMedicationReminder = async (medicationName: string, dosage: string, scheduledTime: Date) => {
    const timeStr = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(scheduledTime)

    const notification = await showNotification({
      title: '💊 Medication Reminder',
      body: `Time to take ${medicationName} (${dosage}) - scheduled for ${timeStr}`,
      icon: '/favicon.ico',
      tag: `medication-${medicationName}-${scheduledTime.getTime()}`,
      requireInteraction: true
    })

    // Speak the reminder if TTS is enabled
    if (notification && isTTSEnabled.value) {
      const ttsMessage = generateTTSMessage('dose', medicationName, dosage)
      await speak(ttsMessage, 'high')
    }

    return notification
  }

  // Show overdue medication notification
  const showOverdueReminder = async (medicationName: string, dosage: string, overdueTime: string) => {
    const notification = await showNotification({
      title: '🚨 Overdue Medication',
      body: `${medicationName} (${dosage}) is overdue by ${overdueTime}`,
      icon: '/favicon.ico',
      tag: `overdue-${medicationName}`,
      requireInteraction: true
    })

    // Speak the overdue alert if TTS is enabled
    if (notification && isTTSEnabled.value) {
      const ttsMessage = generateTTSMessage('overdue', medicationName, dosage, overdueTime)
      await speak(ttsMessage, 'high')
    }

    return notification
  }

  // Send notification for the next dose
  const sendDoseNotification = async () => {
    if (!nextDose.value || !isEnabled.value) {
      return
    }

    const doseId = nextDose.value.id
    const medicationName = nextDose.value.medication.name
    const dosage = nextDose.value.medication.dosage
    const scheduledTime = new Date(nextDose.value.scheduledAt)

    // Don't send duplicate notifications
    if (notifiedDoses.value.has(doseId)) {
      return
    }

    let notification: Notification | null = null
    let notificationEvent: NotificationEvent

    if (isOverdue.value) {
      notification = await showOverdueReminder(medicationName, dosage, overdueTime.value)
      notificationEvent = createNotificationEvent('overdue', medicationName)
    }
    else {
      notification = await showMedicationReminder(medicationName, dosage, scheduledTime)
      notificationEvent = createNotificationEvent('dose', medicationName)
    }

    if (notification) {
      notifiedDoses.value.add(doseId)
      lastNotificationTime.value = new Date()
      lastNotificationEvent.value = notificationEvent

      // Clear this dose from notified set after 1 hour to allow re-notification if still pending
      setTimeout(() => {
        notifiedDoses.value.delete(doseId)
      }, 3600000) // 1 hour
    }
  }

  // Check and send notifications
  const checkAndNotify = () => {
    if (!isEnabled.value || !nextDose.value) {
      return
    }

    const now = new Date()

    // Send notification if:
    // 1. Dose time has arrived (within 1 minute)
    // 2. Dose is overdue (and we haven't notified in the last 30 minutes)
    if (shouldNotify.value
      || (isOverdue.value && (!lastNotificationTime.value
        || now.getTime() - lastNotificationTime.value.getTime() > 1800000))) {
      sendDoseNotification()
    }
  }

  const startMonitoring = () => {
    if (notificationInterval.value) {
      clearInterval(notificationInterval.value)
    }

    notificationInterval.value = setInterval(checkAndNotify, 60000)
    checkAndNotify()
  }

  const stopMonitoring = () => {
    if (notificationInterval.value) {
      clearInterval(notificationInterval.value)
      notificationInterval.value = null
    }
  }

  // Request  permission
  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported.value) {
      throw new Error('Notifications are not supported in this browser')
    }

    try {
      const permission = await Notification.requestPermission()
      notificationPermission.value = permission as NotificationPermission
      isEnabled.value = permission === 'granted'

      if (permission === 'granted') {
        startMonitoring()

        if (typeof useToastMessage === 'function') {
          useToastMessage('success', 'Notifications enabled! You\'ll receive medication reminders.')
        }
      }
      else if (permission === 'denied') {
        if (typeof useToastMessage === 'function') {
          useToastMessage('warning', 'Notifications blocked. You can enable them in your browser settings.')
        }
      }

      return permission as NotificationPermission
    }
    catch (error) {
      console.error('Failed to request notification permission:', error)
      // Show error message
      if (typeof useToastMessage === 'function') {
        useToastMessage('error', 'Failed to enable notifications')
      }
      throw error
    }
  }

  // Initialize the service
  const initializeService = () => {
    if (isInitialized.value) {
      return
    }

    checkSupport()
    initializeAudio()
    initializeTTS()
    setupVisibilityDetection()
    initializeServiceWorker()

    if (isEnabled.value) {
      startMonitoring()
    }

    isInitialized.value = true
  }

  // Watch for changes in notification permission
  watch(isEnabled, (enabled) => {
    if (enabled && isInitialized.value) {
      startMonitoring()
    }
    else {
      stopMonitoring()
    }
  })

  // Watch for changes in next dose
  watch(nextDose, (newDose) => {
    if (newDose && isEnabled.value) {
      notifiedDoses.value.clear()
      checkAndNotify()
    }
  })

  // Computed properties
  const canRequestPermission = computed(() =>
    isSupported.value && notificationPermission.value === 'default'
  )

  const isBlocked = computed(() =>
    notificationPermission.value === 'denied'
  )

  // Initialize on first access
  if (typeof window !== 'undefined') {
    checkSupport()
  }

  return {
    // Core state
    isSupported: readonly(isSupported),
    isEnabled: readonly(isEnabled),
    notificationPermission: readonly(notificationPermission),
    canRequestPermission,
    isBlocked,

    // Service Worker state
    isServiceWorkerSupported: readonly(isServiceWorkerSupported),
    useServiceWorker: readonly(useServiceWorker),

    // Notification state
    lastNotificationEvent: readonly(lastNotificationEvent),
    notificationAnimation: readonly(notificationAnimation),
    isAppVisible: readonly(isAppVisible),

    // TTS state
    isTTSSupported: readonly(isTTSSupported),
    isTTSEnabled,
    isSpeaking: readonly(isSpeaking),
    selectedVoice: readonly(selectedVoice),

    // Computed properties
    shouldNotify,
    isOverdue,
    overdueTime,

    // Main methods
    requestPermission,
    initializeService,
    showNotification,

    // TTS methods
    speak,
    stopSpeaking,
    generateTTSMessage
  }
}
