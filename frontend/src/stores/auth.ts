import { create } from 'zustand'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface AuthStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },
}))
