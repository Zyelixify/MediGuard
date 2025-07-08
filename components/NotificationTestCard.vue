<script setup lang="ts">
const {
  isSupported,
  isEnabled,
  canRequestPermission,
  requestPermission,
  isAppVisible
} = useNotifications()

const isTesting = ref(false)
const isTestingChime = ref(false)
const lastTestTime = ref<Date | null>(null)

// Test dose reminder notification
async function testDoseReminder() {
  if (!isEnabled.value) {
    return
  }

  isTesting.value = true
  lastTestTime.value = new Date()

  try {
    const notification = new Notification('💊 Medication Reminder', {
      body: 'Time to take Test Medication (100mg) - scheduled for now',
      icon: '/favicon.ico',
      tag: 'test-dose-reminder',
      requireInteraction: true,
      silent: isAppVisible.value
    })

    // If app is visible, play chime
    if (isAppVisible.value) {
      await playTestChime()
    }

    setTimeout(() => {
      notification.close()
    }, 5000)

    useToastMessage('success', 'Test dose reminder sent!')
  }
  catch (error) {
    console.error('Test notification failed:', error)
    useToastMessage('error', 'Test notification failed')
  }
  finally {
    isTesting.value = false
  }
}

async function testOverdueReminder() {
  if (!isEnabled.value) {
    return
  }

  isTesting.value = true
  lastTestTime.value = new Date()

  try {
    const notification = new Notification('🚨 Overdue Medication', {
      body: 'Test Medication (100mg) is overdue by 15 minutes',
      icon: '/favicon.ico',
      tag: 'test-overdue-reminder',
      requireInteraction: true,
      silent: isAppVisible.value
    })

    if (isAppVisible.value) {
      await playTestChime()
    }

    setTimeout(() => {
      notification.close()
    }, 5000)

    useToastMessage('success', 'Test overdue alert sent!')
  }
  catch (error) {
    console.error('Test notification failed:', error)
    useToastMessage('error', 'Test notification failed')
  }
  finally {
    isTesting.value = false
  }
}

async function testChimeOnly() {
  isTestingChime.value = true
  lastTestTime.value = new Date()

  try {
    await playTestChime()
    useToastMessage('success', 'Test chime played!')
  }
  catch (error) {
    console.error('Test chime failed:', error)
    useToastMessage('warning', 'Chime not available (check audio file)')
  }
  finally {
    isTestingChime.value = false
  }
}

// Helper functions to test audio
async function playTestChime() {
  try {
    const audio = new Audio('/notification-chime.mp3')
    audio.volume = 0.8
    audio.currentTime = 0
    await audio.play()
  }
  catch (error) {
    console.warn('Test chime failed:', error)
    throw error
  }
}
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center gap-2 sm:gap-3">
        <UIcon name="ic:round-notifications" class="text-primary text-lg sm:text-xl flex-shrink-0" />
        <h3 class="text-base sm:text-xl font-semibold text-default">
          Notification Test
        </h3>
      </div>
    </template>

    <div class="space-y-4">
      <p class="text-sm text-muted">
        Test the notification system and audio chimes. Make sure notifications are enabled first.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <UButton
          variant="outline"
          color="primary"
          icon="ic:round-medication"
          :loading="isTesting"
          :disabled="isTesting || !isEnabled"
          @click="testDoseReminder"
        >
          Test Dose Reminder
        </UButton>

        <UButton
          variant="outline"
          color="error"
          icon="ic:round-warning"
          :loading="isTesting"
          :disabled="isTesting || !isEnabled"
          @click="testOverdueReminder"
        >
          Test Overdue Alert
        </UButton>

        <UButton
          variant="outline"
          color="warning"
          icon="ic:round-volume-up"
          :loading="isTestingChime"
          :disabled="isTestingChime"
          @click="testChimeOnly"
        >
          Test Chime Only
        </UButton>
      </div>

      <div class="flex flex-wrap gap-2">
        <UBadge
          :color="isSupported ? 'success' : 'error'"
          variant="soft"
          size="sm"
        >
          {{ isSupported ? 'Notifications Supported' : 'Not Supported' }}
        </UBadge>

        <UBadge
          :color="isEnabled ? 'success' : 'warning'"
          variant="soft"
          size="sm"
        >
          {{ isEnabled ? 'Enabled' : 'Not Enabled' }}
        </UBadge>

        <UBadge
          v-if="isAppVisible"
          color="primary"
          variant="soft"
          size="sm"
        >
          App Visible (Chime Mode)
        </UBadge>

        <UBadge
          v-else
          color="neutral"
          variant="soft"
          size="sm"
        >
          App Hidden (System Sound)
        </UBadge>
      </div>

      <div v-if="!isEnabled && canRequestPermission" class="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
        <div class="flex items-start gap-3">
          <UIcon name="ic:round-info" class="text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div class="flex-1">
            <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Enable notifications to test
            </p>
            <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Click the button below to enable browser notifications for testing.
            </p>
            <UButton
              size="sm"
              color="warning"
              variant="solid"
              class="mt-2"
              @click="requestPermission()"
            >
              Enable Notifications
            </UButton>
          </div>
        </div>
      </div>

      <div v-if="lastTestTime" class="text-xs text-muted">
        Last test: {{ lastTestTime.toLocaleTimeString() }}
      </div>
    </div>
  </Card>
</template>
