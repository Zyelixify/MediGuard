<script setup lang="ts">
const route = useRoute()

const sidebarConfig = useSidebarConfig()
const { appName } = useRouteTitle(computed(() => route.path))

useHead({ title: appName })
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <div class="hidden md:flex md:w-64 md:flex-col">
      <div class="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div class="flex items-center p-4 justify-center w-full">
          <Logo />
        </div>

        <div class="mt-8 flex-grow flex flex-col">
          <nav class="flex-1 px-2">
            <UNavigationMenu
              :items="sidebarConfig[0]"
              orientation="vertical"
              class="mb-4"
            />
          </nav>

          <div class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 pt-4 px-2">
            <UNavigationMenu
              :items="sidebarConfig[1]"
              orientation="vertical"
              class="mb-4"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Layout -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div class="px-4 py-2">
        <UNavigationMenu
          :items="[...sidebarConfig[0], ...sidebarConfig[1]]"
          orientation="horizontal"
        />
      </div>
    </div>

    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <div class="md:hidden">
        <div class="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
          <div class="flex-1 p-4 flex justify-between">
            <div class="flex-1 flex justify-center items-center w-full">
              <Logo class="h-8" />
            </div>
          </div>
        </div>
      </div>
      <!-- End of Mobile Layout -->

      <main class="flex-1 focus:outline-none">
        <slot />
      </main>
    </div>
  </div>
</template>
