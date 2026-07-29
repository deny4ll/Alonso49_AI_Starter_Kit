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
  isHydrated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  initAuth: () => void
}

const getStoredAuth = () => {
  if (typeof window === 'undefined') return { user: null, token: null }
  
  try {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
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
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    }
    set({ user, token, isHydrated: true })
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    set({ user: null, token: null, isHydrated: true })
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  },
}))
