import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useNotesStore } from '../store/notesStore'
import ReactMarkdown from 'react-markdown'
import { 
  PencilIcon, 
  TrashIcon,
  ArrowLeftIcon,
  TagIcon,
  CalendarIcon,
  DocumentTextIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

const NoteViewPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { 
    currentNote, 
    isLoading, 
    fetchNote, 
    deleteNote,
    clearCurrentNote 
  } = useNotesStore()

  useEffect(() => {
    if (id) {
      fetchNote(id)
    }

    return () => {
      clearCurrentNote()
    }
  }, [id, fetchNote, clearCurrentNote])

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const success = await deleteNote(id)
      if (success) {
        navigate('/dashboard')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Loading note...</p>
      </div>
    )
  }

  if (!currentNote) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Note not found</h2>
        <Link to="/dashboard" className="btn btn-primary">
          <ArrowLeftIcon className="h-5 w-5 mr-2 inline" />
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </Link>
        
        <div className="flex items-center space-x-2">
          <Link
            to={`/notes/${id}/edit`}
            className="btn btn-secondary inline-flex items-center"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="btn btn-danger inline-flex items-center"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Note Content Card */}
      <div className="card">
        {/* Title and Meta */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex-1">
              {currentNote.title}
            </h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ml-4 ${
              currentNote.note_type === 'text' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {currentNote.note_type === 'text' ? (
                <>
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  Text Note
                </>
              ) : (
                <>
                  <RectangleStackIcon className="h-4 w-4 mr-1" />
                  Structured Note
                </>
              )}
            </span>
          </div>

          {/* Tags */}
          {currentNote.tags && currentNote.tags.length > 0 && (
            <div className="flex items-center space-x-2 mb-3">
              <TagIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {currentNote.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>Created {format(new Date(currentNote.created_at), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>Updated {format(new Date(currentNote.updated_at), 'MMM d, yyyy h:mm a')}</span>
            </div>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700 mb-6" />

        {/* Content Display */}
        {currentNote.note_type === 'text' ? (
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <ReactMarkdown>{currentNote.content || 'No content'}</ReactMarkdown>
          </div>
        ) : (
          <div className="space-y-6">
            {currentNote.content && Object.keys(currentNote.content).length > 0 ? (
              Object.entries(currentNote.content).map(([key, value], index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {key}
                  </h2>
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <ReactMarkdown>{value || 'No content'}</ReactMarkdown>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No sections defined</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NoteViewPage
