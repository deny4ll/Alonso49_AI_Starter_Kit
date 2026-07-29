import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const { initAuth, isHydrated } = useAuthStore()
  
  useEffect(() => {
    if (!isHydrated) {
      initAuth()
    }
  }, [initAuth, isHydrated])
  
  return useAuthStore()
}
