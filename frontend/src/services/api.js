import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth-storage')
    if (authData) {
      const { token } = JSON.parse(authData).state
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login-json', credentials),
  getMe: (token) => api.get('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }),
}

// Notes API
export const notesAPI = {
  getNotes: (params) => api.get('/api/notes/', { params }),
  getNote: (id) => api.get(`/api/notes/${id}`),
  createNote: (data) => api.post('/api/notes/', data),
  updateNote: (id, data) => api.put(`/api/notes/${id}`, data),
  deleteNote: (id) => api.delete(`/api/notes/${id}`),
}

export default api