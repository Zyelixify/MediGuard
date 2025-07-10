<script setup lang="ts">
const {
  isSupported,
  isEnabled,
  canRequestPermission,
  requestPermission,
  isAppVisible,
  isTTSSupported,
  isTTSEnabled,
  isSpeaking,
  ttsVoices,
  selectedVoice,
  speak,
  stopSpeaking,
  generateTTSMessage,
  initializeService
} = useNotifications()

const isTesting = ref(false)
const isTestingChime = ref(false)
const isTestingTTS = ref(false)
const lastTestTime = ref<Date | null>(null)

// Initialize notification service (including TTS)
onMounted(() => {
  initializeService()
})

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

    // Test TTS if enabled
    if (isTTSEnabled.value && isTTSSupported.value) {
      const ttsMessage = generateTTSMessage('dose', 'Test Medication', '100mg')
      await speak(ttsMessage, 'high')
    }

    setTimeout(() => {
      notification.close()
    }, 5000)

    useToastMessage('success', 'Test dose reminder sent!')
  }
  catch (error) {
    useToastMessage('error', `Test notification failed due to error: ${error}`)
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

    // Test TTS if enabled
    if (isTTSEnabled.value && isTTSSupported.value) {
      const ttsMessage = generateTTSMessage('overdue', 'Test Medication', '100mg', '15 minutes')
      await speak(ttsMessage, 'high')
    }

    setTimeout(() => {
      notification.close()
    }, 5000)

    useToastMessage('success', 'Test overdue alert sent!')
  }
  catch (error) {
    useToastMessage('error', `Test notification failed due to error: ${error}`)
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
    useToastMessage('warning', `Chime failed to play: ${error}`)
  }
  finally {
    isTestingChime.value = false
  }
}

async function testTTSOnly() {
  if (!isTTSSupported.value) {
    useToastMessage('warning', 'Text-to-Speech not supported in this browser')
    return
  }

  isTestingTTS.value = true
  lastTestTime.value = new Date()

  try {
    const voiceName = selectedVoice.value ? selectedVoice.value.name : 'Default'
    const testMessage = `This is a test of the medication reminder voice system using ${voiceName}. Text-to-Speech is working correctly.`
    const success = await speak(testMessage, 'high')

    if (!success) {
      useToastMessage('warning', 'TTS is disabled or failed to speak')
    }
  }
  catch (error) {
    useToastMessage('error', `TTS test failed due to an error: ${error}`)
  }
  finally {
    isTestingTTS.value = false
  }
}

function toggleTTS() {
  isTTSEnabled.value = !isTTSEnabled.value
  const status = isTTSEnabled.value ? 'enabled' : 'disabled'
  useToastMessage('info', `Text-to-Speech ${status}`)
}

function stopCurrentSpeech() {
  if (isSpeaking.value) {
    stopSpeaking()
    useToastMessage('info', 'Speech stopped')
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
    useToastMessage('error', `Chime failed to play: ${error}`)
  }
}
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center gap-2 sm:gap-3">
        <UIcon name="ic:round-notifications" class="text-primary text-lg sm:text-xl flex-shrink-0" />
        <h3 class="text-base sm:text-xl font-semibold text-default">
          Notification Demo Test (Dev Only)
        </h3>
      </div>
    </template>

    <div class="space-y-4">
      <p class="text-sm text-muted">
        Test the notification system, audio chimes, and text-to-speech (TTS). Make sure notifications are enabled first.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <UButton
          variant="outline"
          color="primary"
          icon="ic:round-medication"
          :loading="isTesting"
          @click="testDoseReminder"
        >
          Test Dose Reminder
        </UButton>

        <UButton
          variant="outline"
          color="error"
          icon="ic:round-warning"
          :loading="isTesting"
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

        <UButton
          variant="outline"
          color="info"
          icon="ic:round-record-voice-over"
          :loading="isTestingTTS"
          :disabled="isTestingTTS || !isTTSSupported"
          @click="testTTSOnly"
        >
          Test TTS Only
        </UButton>

        <UButton
          variant="outline"
          :color="isTTSEnabled ? 'success' : 'neutral'"
          :icon="isTTSEnabled ? 'ic:round-volume-up' : 'ic:round-volume-off'"
          :disabled="!isTTSSupported"
          @click="toggleTTS"
        >
          {{ isTTSEnabled ? 'TTS On' : 'TTS Off' }}
        </UButton>

        <UButton
          variant="outline"
          color="error"
          icon="ic:round-stop"
          :disabled="!isSpeaking"
          @click="stopCurrentSpeech"
        >
          Stop Speech
        </UButton>
      </div>

      <!-- Voice Selection -->
      <div v-if="isTTSSupported && ttsVoices.length > 0" class="space-y-2">
        <label class="text-sm font-medium text-default">
          Voice Selection:
        </label>
        <select
          v-model="selectedVoice"
          class="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-600 text-sm max-w-md"
        >
          <option :value="null">
            Default Voice
          </option>
          <option
            v-for="voice in ttsVoices"
            :key="voice.name"
            :value="voice"
          >
            {{ voice.name }} ({{ voice.lang }})
          </option>
        </select>
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
          :color="isTTSSupported ? 'success' : 'error'"
          variant="soft"
          size="sm"
        >
          {{ isTTSSupported ? 'TTS Supported' : 'TTS Not Supported' }}
        </UBadge>

        <UBadge
          v-if="isTTSSupported"
          :color="isTTSEnabled ? 'success' : 'warning'"
          variant="soft"
          size="sm"
        >
          {{ isTTSEnabled ? 'TTS Enabled' : 'TTS Disabled' }}
        </UBadge>

        <UBadge
          v-if="isSpeaking"
          color="info"
          variant="soft"
          size="sm"
        >
          Speaking...
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

        <UBadge
          v-if="isTTSSupported && ttsVoices.length > 0"
          color="info"
          variant="soft"
          size="sm"
        >
          {{ ttsVoices.length }} Voice{{ ttsVoices.length !== 1 ? 's' : '' }} Available
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
