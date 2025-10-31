import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import SearchBar from './SearchBar'
import { 
  HomeIcon, 
  PlusIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  MoonIcon,
  SunIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { isDarkMode, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  return (
    <nav 
      role="navigation" 
      aria-label="Main navigation"
      className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200"
    >
      <div className="container mx-auto px-4">
        {/* Top bar - Always visible */}
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 flex-shrink-0 z-10"
            aria-label="Notes2GoGo home"
          >
            <DocumentTextIcon 
              className="h-8 w-8 text-primary-600 dark:text-primary-400" 
              aria-hidden="true"
            />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 hidden sm:inline whitespace-nowrap">Notes2GoGo</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:hidden">N2G</span>
          </Link>

          {/* Desktop Search Bar - Center of navbar */}
          {isAuthenticated && (
            <div className="hidden lg:flex flex-1 max-w-2xl mx-4">
              <SearchBar inNavbar={true} />
            </div>
          )}

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-2 flex-shrink-0 whitespace-nowrap">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <SunIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <MoonIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Go to dashboard"
                >
                  <HomeIcon className="h-5 w-5" aria-hidden="true" />
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  to="/notes/new"
                  className="flex items-center space-x-1 btn btn-primary"
                  aria-label="Create new note (Alt+N)"
                >
                  <PlusIcon className="h-5 w-5" aria-hidden="true" />
                  <span>New Note</span>
                </Link>

                <div 
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 dark:text-gray-300"
                  aria-label={`Logged in as ${user?.username}`}
                >
                  <UserIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm">{user?.username}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Log out"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Log in to your account"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  aria-label="Create new account"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button and theme toggle */}
          <div className="flex items-center space-x-2 lg:hidden">
            {/* Theme Toggle - Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <SunIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <MoonIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>

            {/* Mobile menu toggle */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle mobile menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Search Bar - Full width on mobile, below the main nav */}
        {isAuthenticated && (
          <div className="pb-4 lg:hidden">
            <SearchBar inNavbar={true} />
          </div>
        )}

        {/* Mobile Menu - Slide down */}
        {isAuthenticated && mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <HomeIcon className="h-5 w-5" aria-hidden="true" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/notes/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <PlusIcon className="h-5 w-5" aria-hidden="true" />
              <span>New Note</span>
            </Link>

            <div className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 mt-2 pt-4">
              <UserIcon className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm">{user?.username}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Mobile Login/Register buttons */}
        {!isAuthenticated && (
          <div className="lg:hidden flex items-center justify-end space-x-2 pb-4">
            <Link
              to="/login"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn btn-primary"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar