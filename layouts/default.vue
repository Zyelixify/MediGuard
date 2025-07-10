<script setup lang="ts">
const route = useRoute()

const sidebarConfig = useSidebarConfig()
const { appName } = useRouteTitle(computed(() => route.path))

useHead({ title: appName })
</script>

<template>
  <div class="flex h-screen bg-default">
    <div class="hidden md:flex md:w-64 md:flex-col">
      <div class="flex flex-col flex-grow overflow-y-auto bg-muted border-r border-default">
        <div class="flex items-center p-8 justify-center w-full border-b border-default">
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

          <div class="flex-shrink-0 border-t border-default pt-4 px-2">
            <UNavigationMenu
              :items="sidebarConfig[1]"
              orientation="vertical"
              class="mb-4"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="md:hidden fixed bottom-0 left-0 right-0 bg-muted border-t border-default z-50 ">
      <div class="px-4 py-2 flex justify-between">
        <UNavigationMenu
          :items="sidebarConfig[0]"
          orientation="horizontal"
        />
      </div>
    </div>

    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <div class="md:hidden">
        <div class="relative z-10 flex-shrink-0 flex h-16 bg-muted shadow border-b border-default">
          <div class="flex-1 p-4 flex justify-between">
            <div class="flex-1 flex justify-between items-center w-full">
              <div class="flex items-center gap-2">
                <UIcon name="ic:twotone-shield" class="w-6 h-6 text-primary" />
                <Logo class="h-8 mb-2" collapsed />
              </div>

              <UNavigationMenu
                :items="sidebarConfig[1]"
                orientation="horizontal"
              />
            </div>
          </div>
        </div>
      </div>

      <main class="flex-1 focus:outline-none bg-default min-h-screen overflow-y-scroll custom-scrollbar">
        <slot />
      </main>
    </div>
  </div>
</template>
