import { create } from 'zustand'

export type Lang = 'es' | 'en'

interface LanguageStore {
  lang: Lang
  isHydrated: boolean
  setLang: (lang: Lang) => void
  initLang: () => void
}

export const useLanguageStore = create<LanguageStore>((set, get) => ({
  lang: 'es',
  isHydrated: false,

  initLang: () => {
    if (get().isHydrated) return
    const stored = typeof window !== 'undefined' ? (localStorage.getItem('lang') as Lang | null) : null
    set({ lang: stored === 'en' ? 'en' : 'es', isHydrated: true })
  },

  setLang: (lang) => {
    if (typeof window !== 'undefined') localStorage.setItem('lang', lang)
    set({ lang })
  },
}))
