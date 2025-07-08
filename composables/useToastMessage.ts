export default function useToastMessage(type: 'success' | 'error' | 'warning' | 'info', message: string) {
  const toast = useToast()

  const iconMap = {
    success: 'ic:round-check-circle',
    error: 'ic:round-error',
    warning: 'ic:round-warning',
    info: 'ic:round-info'
  }

  const colorMap = {
    success: 'success' as const,
    error: 'error' as const,
    warning: 'warning' as const,
    info: 'primary' as const
  }

  toast.add({
    title: type.charAt(0).toUpperCase() + type.slice(1),
    description: message,
    color: colorMap[type],
    duration: 5000,
    icon: iconMap[type],
  })
}
