import { create } from 'zustand'

interface Trainer {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'TRAINER' | 'ADMIN'
}

interface AuthStore {
  user: Trainer | null
  token: string | null
  isHydrated: boolean
  setAuth: (user: Trainer, token: string) => void
  logout: () => void
  initAuth: () => void
}

const getStoredAuth = () => {
  if (typeof window === 'undefined') return { user: null, token: null }
  try {
    const token = localStorage.getItem('ts_token')
    const userStr = localStorage.getItem('ts_user')
    const user = userStr ? JSON.parse(userStr) : null
    return { user, token }
  } catch {
    return { user: null, token: null }
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isHydrated: false,

  initAuth: () => {
    const { user, token } = getStoredAuth()
    set({ user, token, isHydrated: true })
  },

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ts_token', token)
      localStorage.setItem('ts_user', JSON.stringify(user))
    }
    set({ user, token, isHydrated: true })
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ts_token')
      localStorage.removeItem('ts_user')
    }
    set({ user: null, token: null, isHydrated: true })
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },
}))
