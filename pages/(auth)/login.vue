<script lang="ts" setup>
import { loginSchema, roleOptions, signupSchema } from '~/types/auth'
import type { LoginSchema, SignupSchema } from '~/types/auth'

definePageMeta({
  layout: 'simple',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
})
useHead({ title: `Login` })

// Form data for login
const loginData = reactive<LoginSchema>({
  email: '',
  password: '',
})

// Form data for signup
const signupData = reactive<SignupSchema>({
  name: '',
  email: '',
  password: '',
  role: 'user',
})

const { signIn } = useAuth()
const toast = useToast()
const isLoginLoading = ref<boolean>(false)
const isSignupLoading = ref<boolean>(false)

// Login handler
async function handleLogin() {
  isLoginLoading.value = true
  const res = await signIn('credentials', {
    ...loginData,
    type: 'login',
    redirect: false
  })

  if (res?.error) {
    toast.add({
      title: 'Login Failed',
      description: res.error,
      duration: 5000,
      color: 'error',
      icon: 'i-heroicons-x-circle',
    })
  }
  else {
    toast.add({
      title: 'Welcome Back!',
      description: 'You have successfully logged in.',
      duration: 5000,
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
    navigateTo('/')
  }

  isLoginLoading.value = false
}

// Signup handler
async function handleSignup() {
  isSignupLoading.value = true

  const res = await signIn('credentials', {
    ...signupData,
    type: 'register',
    redirect: false
  })

  if (res?.error) {
    toast.add({
      title: 'Signup Failed',
      description: res.error,
      duration: 5000,
      color: 'error',
      icon: 'i-heroicons-x-circle',
    })
  }
  else {
    toast.add({
      title: 'Account Created!',
      description: 'Welcome to MediGuard!',
      duration: 5000,
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
    navigateTo('/')
  }

  isSignupLoading.value = false
}
</script>

<template>
  <div class="flex flex-grow flex-col items-center justify-center w-full max-w-4xl mx-auto gap-6">
    <Logo />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full p-2">
      <!-- Login Card -->
      <Card class="w-full">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="ic:round-login" class="text-primary text-xl" />
            <h1 class="text-xl font-semibold">
              Login
            </h1>
          </div>
        </template>

        <UForm :schema="loginSchema" :state="loginData" @submit="handleLogin">
          <div class="flex flex-col gap-4">
            <UFormField
              name="email"
              label="Email"
            >
              <UInput
                v-model="loginData.email"
                placeholder="Enter your email"
                class="w-full"
                icon="ic:round-email"
              />
            </UFormField>

            <UFormField
              name="password"
              label="Password"
            >
              <UInput
                v-model="loginData.password"
                type="password"
                placeholder="Enter your password"
                class="w-full"
                icon="ic:round-lock"
              />
            </UFormField>

            <UButton
              type="submit"
              :loading="isLoginLoading"
              class="w-full justify-center"
              size="lg"
              variant="solid"
              color="primary"
            >
              {{ isLoginLoading ? 'Signing in...' : 'Sign In' }}
            </UButton>
          </div>
        </UForm>
      </Card>

      <!-- Signup Card -->
      <Card class="w-full">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="ic:round-person-add" class="text-success text-xl" />
            <h1 class="text-xl font-semibold">
              Sign Up
            </h1>
          </div>
        </template>

        <UForm :schema="signupSchema" :state="signupData" @submit="handleSignup">
          <div class="flex flex-col gap-4">
            <UFormField
              name="name"
              label="Full Name"
            >
              <UInput
                v-model="signupData.name"
                placeholder="Enter your full name"
                class="w-full"
                icon="ic:round-person"
              />
            </UFormField>

            <UFormField
              name="email"
              label="Email"
            >
              <UInput
                v-model="signupData.email"
                placeholder="Enter your email"
                class="w-full"
                icon="ic:round-email"
              />
            </UFormField>

            <UFormField
              name="password"
              label="Password"
            >
              <UInput
                v-model="signupData.password"
                type="password"
                placeholder="Create a password"
                class="w-full"
                icon="ic:round-lock"
              />
            </UFormField>

            <UFormField
              name="role"
              label="Account Type"
            >
              <USelect
                v-model="signupData.role"
                :items="roleOptions"
                placeholder="Select account type"
                class="w-full"
              />
            </UFormField>

            <UButton
              type="submit"
              :loading="isSignupLoading"
              class="w-full justify-center"
              size="lg"
              variant="solid"
              color="success"
            >
              {{ isSignupLoading ? 'Creating account...' : 'Create Account' }}
            </UButton>
          </div>
        </UForm>
      </Card>
    </div>
  </div>
</template>
