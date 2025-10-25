import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { 
  HomeIcon, 
  PlusIcon, 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <DocumentTextIcon className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Notes2GoGo</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <HomeIcon className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                
                <Link
                  to="/notes/new"
                  className="flex items-center space-x-1 btn btn-primary"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>New Note</span>
                </Link>

                <div className="flex items-center space-x-2 text-gray-700">
                  <UserIcon className="h-5 w-5" />
                  <span className="text-sm">{user?.username}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar