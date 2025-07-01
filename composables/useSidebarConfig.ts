import type { NavigationMenuItem } from '@nuxt/ui'

export default () => ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Dashboard',
      icon: 'ic:baseline-dashboard',
      to: '/caretaker/dashboard',
    },
    {
      label: 'Patients',
      icon: 'ic:baseline-people',
      to: '/caretaker/patients',
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'ic:baseline-log-out',
      to: '/logout',
    }
  ]
])
