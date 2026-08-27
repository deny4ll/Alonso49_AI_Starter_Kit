import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ts_token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('ts_token')
      localStorage.removeItem('ts_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

export const documentsApi = {
  upload: (file: File, title: string, category: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('category', category)
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const entriesApi = {
  create: (data: { title: string; category: string; content: string; submit: boolean }) =>
    api.post('/entries', data),
  list: (filters?: { status?: string; origin?: string }) => api.get('/entries', { params: filters }),
  approve: (id: string) => api.patch(`/entries/${id}/approve`),
  reject: (id: string) => api.patch(`/entries/${id}/reject`),
  confirmPii: (id: string) => api.patch(`/entries/${id}/confirm-pii`),
  exportStatus: () => api.get('/entries/export-status'),
}

export const testChatApi = {
  ask: (question: string, category?: string) => api.post('/test-chat/ask', { question, category }),
  save: (data: {
    title: string
    category: string
    question: string
    aiAnswer: string
    correctedAnswer?: string
    action: 'APPROVE' | 'CORRECT'
  }) => api.post('/test-chat/save', data),
}
