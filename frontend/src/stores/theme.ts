import { create } from 'zustand'

export type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeStore {
  mode: ThemeMode
  isHydrated: boolean
  setMode: (mode: ThemeMode) => void
  initTheme: () => void
}

function applyMode(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  mode: 'system',
  isHydrated: false,

  initTheme: () => {
    if (get().isHydrated) return
    const stored = typeof window !== 'undefined' ? (localStorage.getItem('theme') as ThemeMode | null) : null
    const mode = stored || 'system'
    applyMode(mode)
    set({ mode, isHydrated: true })

    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (get().mode === 'system') applyMode('system')
      })
    }
  },

  setMode: (mode) => {
    if (typeof window !== 'undefined') localStorage.setItem('theme', mode)
    applyMode(mode)
    set({ mode })
  },
}))
