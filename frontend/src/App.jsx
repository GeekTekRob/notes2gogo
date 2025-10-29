import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'
import { ToastProvider } from './components/ToastContainer'
import KeyboardShortcuts from './components/KeyboardShortcuts'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import NoteEditorPage from './pages/NoteEditorPage'
import NoteViewPage from './pages/NoteViewPage'
import TagManagePage from './pages/TagManagePage'
import SearchResultsPage from './pages/SearchResultsPage'

function App() {
  const { isAuthenticated } = useAuthStore()
  const initializeTheme = useThemeStore((state) => state.initializeTheme)

  // Initialize theme on app load
  useEffect(() => {
    initializeTheme()
  }, [initializeTheme])

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Navbar />
        <main role="main" className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes/new"
              element={
                <ProtectedRoute>
                  <NoteEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes/:id"
              element={
                <ProtectedRoute>
                  <NoteViewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes/:id/edit"
              element={
                <ProtectedRoute>
                  <NoteEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tags/manage"
              element={
                <ProtectedRoute>
                  <TagManagePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchResultsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        
        {/* Global keyboard shortcuts help */}
        {isAuthenticated && <KeyboardShortcuts />}
      </div>
    </ToastProvider>
  )
}

export default App