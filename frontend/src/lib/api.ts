import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) =>
    api.post('/auth/register', data),
  me: () =>
    api.get('/auth/me'),
}

export const sessionsApi = {
  getAll: () => api.get('/sessions'),
  getOne: (id: string) => api.get(`/sessions/${id}`),
  create: (data: any) => api.post('/sessions', data),
  update: (id: string, data: any) => api.patch(`/sessions/${id}`, data),
  delete: (id: string) => api.delete(`/sessions/${id}`),
}

export const videosApi = {
  getAll: () => api.get('/videos'),
  getOne: (id: string) => api.get(`/videos/${id}`),
  create: (data: any) => api.post('/videos', data),
  update: (id: string, data: any) => api.patch(`/videos/${id}`, data),
  delete: (id: string) => api.delete(`/videos/${id}`),
}

export const teamsApi = {
  getAll: () => api.get('/teams'),
  getOne: (id: string) => api.get(`/teams/${id}`),
  create: (data: any) => api.post('/teams', data),
  update: (id: string, data: any) => api.patch(`/teams/${id}`, data),
  addMember: (id: string, userId: string) => api.post(`/teams/${id}/members`, { userId }),
}

export const coursesApi = {
  getAll: () => api.get('/courses'),
  getOne: (id: string) => api.get(`/courses/${id}`),
  create: (data: any) => api.post('/courses', data),
  enroll: (id: string) => api.post(`/courses/${id}/enroll`),
}

export const aiCoachApi = {
  chat: (message: string, context?: any) => api.post('/ai-coach/chat', { message, ...context }),
  analyzeVideo: (videoId: string, specificQuestion?: string) => 
    api.post('/ai-coach/analyze-video', { videoId, specificQuestion }),
  analyzeSession: (sessionId: string) => 
    api.post('/ai-coach/analyze-session', { sessionId }),
  getTrainingPlan: (goals?: string) => 
    api.post('/ai-coach/training-plan', { goals }),
  getHistory: () => api.get('/ai-coach/history'),
}
