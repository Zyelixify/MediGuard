import type { NavigationMenuItem } from '@nuxt/ui'

export default () => ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Dashboard',
      icon: 'ic:baseline-dashboard',
      to: '/caretaker/dashboard',
    },
  ],
  [
    {
      label: 'Logout',
      icon: 'ic:baseline-log-out',
      to: '/logout',
    }
  ]
])
