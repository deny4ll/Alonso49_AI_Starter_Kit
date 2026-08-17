import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const GATE_USER = process.env.NEXT_PUBLIC_GATE_USER
const GATE_PASSWORD = process.env.NEXT_PUBLIC_GATE_PASSWORD
const gateAuth =
  GATE_USER && GATE_PASSWORD
    ? `Basic ${btoa(`${GATE_USER}:${GATE_PASSWORD}`)}`
    : undefined

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(gateAuth ? { 'X-Gate-Auth': gateAuth } : {}),
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
  getAll: (teamId?: string) => api.get('/sessions', { params: teamId ? { teamId } : undefined }),
  getOne: (id: string) => api.get(`/sessions/${id}`),
  create: (data: any) => api.post('/sessions', data),
  update: (id: string, data: any) => api.patch(`/sessions/${id}`, data),
  delete: (id: string) => api.delete(`/sessions/${id}`),
}

export const videosApi = {
  getAll: (filters?: Record<string, any>) => api.get('/videos', { params: filters }),
  getOne: (id: string) => api.get(`/videos/${id}`),
  create: (data: any) => api.post('/videos', data),
  uploadFile: (file: File, fields: Record<string, any>) => {
    const formData = new FormData()
    formData.append('file', file)
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null || value === '') continue
      formData.append(key, typeof value === 'string' ? value : JSON.stringify(value))
    }
    return api.post('/videos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  update: (id: string, data: any) => api.patch(`/videos/${id}`, data),
  delete: (id: string) => api.delete(`/videos/${id}`),
  getLoadDistribution: (teamId?: string) =>
    api.get('/videos/load-distribution', { params: teamId ? { teamId } : undefined }),
}

export const tagsApi = {
  getAll: () => api.get('/tags'),
}

export const usersApi = {
  updateProfile: (data: { firstName?: string; lastName?: string }) => api.patch('/users/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/users/me/password', data),
  getAthleteProfile: () => api.get('/users/me/athlete-profile'),
  updateAthleteProfile: (data: Record<string, any>) => api.patch('/users/me/athlete-profile', data),
}

export const knowledgeBaseApi = {
  getDocuments: () => api.get('/knowledge-base/documents'),
  uploadDocument: (file: File, fields: { title: string; category: string }) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', fields.title)
    formData.append('category', fields.category)
    return api.post('/knowledge-base/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteDocument: (id: string) => api.delete(`/knowledge-base/documents/${id}`),
}

export const progressApi = {
  getSummary: (teamId?: string) => api.get('/progress', { params: teamId ? { teamId } : undefined }),
}

export const trackersApi = {
  getAll: (filters?: { sessionId?: string; teamId?: string }) => api.get('/trackers', { params: filters }),
  getOne: (id: string) => api.get(`/trackers/${id}`),
  create: (data: any) => api.post('/trackers', data),
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
  search: (filters: Record<string, any>) => api.get('/ai-coach/search', { params: filters }),
}

export const analyticsApi = {
  getMyStats: () => api.get('/analytics/users/me/stats'),
  getBenchmark: (teamId: string) => api.get(`/analytics/teams/${teamId}/benchmark`),
  upsertBenchmark: (teamId: string, data: any) => api.post(`/analytics/teams/${teamId}/benchmark`, data),
  getComparison: (teamId: string) => api.get(`/analytics/teams/${teamId}/comparison`),
  getBigPicture: (teamId: string) => api.get(`/analytics/teams/${teamId}/big-picture`),
  upsertBigPicture: (teamId: string, content: string) =>
    api.post(`/analytics/teams/${teamId}/big-picture`, { content }),
}
