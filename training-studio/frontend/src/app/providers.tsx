'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30 * 1000 } },
      }),
  )

  const initAuth = useAuthStore((state) => state.initAuth)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  useEffect(() => {
    if (!isHydrated) initAuth()
  }, [initAuth, isHydrated])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
