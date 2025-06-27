<script lang="ts" setup>
import z from 'zod'

definePageMeta({
  layout: 'simple',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
})
useHead({ title: `Login` })

const schema = z.object({
  email: z.string().email().min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  type: z.enum(['login', 'signup']).optional(),
})
type Schema = z.infer<typeof schema>

const formData = reactive<Schema>({
  email: '',
  password: '',
})

const { signIn } = useAuth()
const toast = useToast()
const isLoading = ref<boolean>(false)

async function submitHandler() {
  isLoading.value = true
  const res = await signIn('credentials', { ...formData, redirect: false })

  if (res?.error) {
    toast.add({
      title: 'Error',
      description: res.error,
      duration: 5000,
    })
  }
  else {
    toast.add({
      title: 'Success',
      description: 'You have successfully logged in.',
      duration: 5000,
    })
    navigateTo('/')
  }

  isLoading.value = false
}
</script>

<template>
  <div class="flex flex-grow flex-col items-center justify-center w-full max-w-md mx-auto gap-6">
    <Logo />
    <UCard class="w-full">
      <template #header>
        <h1 class="text-center text-xl font-semibold">
          Login | Signup
        </h1>
      </template>

      <UForm :schema :state="formData" @submit="submitHandler">
        <div class="flex flex-col gap-4">
          <UFormField
            name="email"
            label="Email"
          >
            <UInput v-model="formData.email" placeholder="Enter your email" class="w-full" />
          </UFormField>
          <UFormField
            name="password"
            label="Password"
          >
            <UInput v-model="formData.password" type="password" placeholder="Enter your password" class="w-full" />
          </UFormField>
          <UButton
            type="submit"
            :loading="isLoading"
            class="w-full mt-4 justify-center"
            size="lg"
            variant="solid"
            color="primary"
          >
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
