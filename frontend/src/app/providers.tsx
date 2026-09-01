'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useLanguageStore } from '@/stores/language'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }))

  const initAuth = useAuthStore((state) => state.initAuth)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const initTheme = useThemeStore((state) => state.initTheme)
  const initLang = useLanguageStore((state) => state.initLang)
  const lang = useLanguageStore((state) => state.lang)

  useEffect(() => {
    if (!isHydrated) {
      initAuth()
    }
    initTheme()
    initLang()
  }, [initAuth, isHydrated, initTheme, initLang])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
