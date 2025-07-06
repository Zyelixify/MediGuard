<template>
  <UCard class="bg-muted border-default">
    <template v-if="$slots.header || $slots.headerExtra" #header>
      <div class="flex items-center justify-between">
        <slot name="header" />

        <slot name="headerExtra" />
      </div>
    </template>
    <slot />
  </UCard>
</template>
