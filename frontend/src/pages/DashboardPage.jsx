import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotesStore } from '../store/notesStore'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

const DashboardPage = () => {
  const {
    notes,
    isLoading,
    pagination,
    filters,
    fetchNotes,
    setFilters,
    deleteNote,
  } = useNotesStore()

  const [searchInput, setSearchInput] = useState(filters.search)

  useEffect(() => {
    fetchNotes(1)
  }, [fetchNotes])

  // Live search with debouncing
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setFilters({ search: searchInput })
      fetchNotes(1)
    }, 300) // Wait 300ms after user stops typing

    return () => clearTimeout(delayDebounce)
  }, [searchInput, setFilters, fetchNotes])

  const handleSearch = (e) => {
    e.preventDefault()
    // Search is now handled by the useEffect above
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(id)
    }
  }

  const handlePageChange = (newPage) => {
    fetchNotes(newPage)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total} notes total
          </p>
        </div>
        <Link to="/notes/new" className="btn btn-primary inline-flex items-center whitespace-nowrap">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Note
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes (title, tags, content)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input pl-10"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first note.</p>
          <Link to="/notes/new" className="btn btn-primary inline-flex items-center whitespace-nowrap">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Your First Note
          </Link>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {notes.map((note) => (
              <div key={note.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
                    {note.title}
                  </h3>
                  <div className="flex space-x-2 ml-2">
                    <Link
                      to={`/notes/${note.id}/edit`}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    note.note_type === 'text' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {note.note_type === 'text' ? 'Text' : 'Structured'}
                  </span>
                </div>

                <div className="prose text-sm text-gray-600 mb-4 line-clamp-3">
                  {note.note_type === 'text' 
                    ? note.content?.substring(0, 150) + (note.content?.length > 150 ? '...' : '')
                    : `${Object.keys(note.content || {}).length} sections`
                  }
                </div>

                {note.tags && note.tags.length > 0 && (
                  <div className="flex items-center space-x-1 mb-3">
                    <TagIcon className="h-4 w-4 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{note.tags.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center text-xs text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Updated {format(new Date(note.updated_at), 'MMM d, yyyy')}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > pagination.per_page && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_prev}
                className="btn btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.per_page)}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
                className="btn btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default DashboardPage