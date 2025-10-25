import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.login(credentials)
          const { access_token } = response.data
          
          // Get user info
          const userResponse = await authAPI.getMe(access_token)
          const user = userResponse.data
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
          })
          
          toast.success('Login successful!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.detail || 'Login failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          await authAPI.register(userData)
          set({ isLoading: false })
          toast.success('Registration successful! Please login.')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.detail || 'Registration failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        toast.success('Logged out successfully')
      },

      // Initialize auth state from stored token
      initializeAuth: async () => {
        const { token } = get()
        if (token) {
          try {
            const userResponse = await authAPI.getMe(token)
            const user = userResponse.data
            set({
              user,
              isAuthenticated: true,
            })
          } catch (error) {
            // Token is invalid, clear auth state
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            })
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)