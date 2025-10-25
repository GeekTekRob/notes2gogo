import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { 
  DocumentTextIcon, 
  PencilSquareIcon, 
  TagIcon,
  ClockIcon,
  UserGroupIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const HomePage = () => {
  const { isAuthenticated } = useAuthStore()

  const features = [
    {
      icon: <DocumentTextIcon className="h-8 w-8 text-primary-600" />,
      title: "Rich Text Notes",
      description: "Create beautiful notes with Markdown support and rich formatting options."
    },
    {
      icon: <PencilSquareIcon className="h-8 w-8 text-primary-600" />,
      title: "Structured Content",
      description: "Organize information with key-value sections for complex note structures."
    },
    {
      icon: <TagIcon className="h-8 w-8 text-primary-600" />,
      title: "Smart Organization",
      description: "Tag and categorize your notes for easy discovery and management."
    },
    {
      icon: <ClockIcon className="h-8 w-8 text-primary-600" />,
      title: "Always Accessible",
      description: "Access your notes from anywhere with our cloud-based storage."
    },
    {
      icon: <UserGroupIcon className="h-8 w-8 text-primary-600" />,
      title: "User-Friendly",
      description: "Intuitive interface designed for productivity and ease of use."
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8 text-primary-600" />,
      title: "Secure & Private",
      description: "Your notes are protected with industry-standard security measures."
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Your Notes, 
          <span className="text-primary-600"> Everywhere</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          A lightweight, scalable notes service that adapts to your workflow. 
          Create simple text notes or complex structured content with rich formatting.
        </p>
        
        {!isAuthenticated ? (
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        ) : (
          <div className="flex justify-center space-x-4">
            <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-3">
              Go to Dashboard
            </Link>
            <Link to="/notes/new" className="btn btn-secondary text-lg px-8 py-3">
              Create Note
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything you need to organize your thoughts
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-50 rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to get organized?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Join thousands of users who trust Notes2GoGo for their note-taking needs.
        </p>
        
        {!isAuthenticated && (
          <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
            Start Taking Notes Today
          </Link>
        )}
      </div>
    </div>
  )
}

export default HomePage