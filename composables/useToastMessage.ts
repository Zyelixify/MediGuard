export default function useToastMessage(type: 'success' | 'error', message: string) {
  const toast = useToast()

  toast.add({
    title: type.charAt(0).toUpperCase() + type.slice(1),
    description: message,
    color: type,
    duration: 5000,
    icon: type === 'success' ? 'check_circle' : 'error',
  })
}
