import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useNotesStore } from '../store/notesStore'
import { useToast } from '../components/ToastContainer'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import TagManager from '../components/TagManager'
import SavedSearchesDashboard from '../components/SavedSearchesDashboard'
import SearchAnalytics from '../components/SearchAnalytics'
import { 
  PlusIcon, 
  PencilIcon,
  TrashIcon,
  TagIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon
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

  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedTags, setSelectedTags] = useState([])
  const [sidebarVisible, setSidebarVisible] = useState(false) // Start hidden on mobile

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onToggleSidebar: () => setSidebarVisible(prev => !prev)
  })

  useEffect(() => {
    const tagParam = searchParams.get('tag')
    if (tagParam) {
      setSelectedTags([tagParam])
      setFilters({
        tags: tagParam,
        tag_filter_mode: 'and',
        exclude_tags: '',
      })
      setSearchParams({})
    }
    fetchNotes(1)
  }, [fetchNotes])

  const handleDelete = async (id, noteTitle) => {
    if (window.confirm(`Are you sure you want to delete "${noteTitle}"?`)) {
      const result = await deleteNote(id)
      if (result) {
        showToast('Note deleted successfully', 'success')
      } else {
        showToast('Failed to delete note', 'error')
      }
    }
  }

  const handlePageChange = (newPage) => {
    fetchNotes(newPage)
  }

  const handleTagClick = (tag) => {
    let next = []
    if (selectedTags.includes(tag)) {
      next = selectedTags.filter(t => t !== tag)
    } else {
      next = [...selectedTags, tag]
    }
    setSelectedTags(next)

    const tagsParam = next.join(',')
    const filterPayload = { tags: tagsParam, exclude_tags: '', tag_filter_mode: 'or' }

    setFilters(filterPayload)
    fetchNotes(1)
  }

  const clearTagFilter = () => {
    setSelectedTags([])
    setFilters({ tags: '', exclude_tags: '', tag_filter_mode: 'or' })
    fetchNotes(1)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6">
        {/* Main content - Shows first on mobile */}
        <main className="lg:col-span-3 order-1 lg:order-2" role="main">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Notes</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {pagination.total} notes total
                </p>
              </div>
              {/* Mobile: Show Filters button */}
              <button
                onClick={() => setSidebarVisible(prev => !prev)}
                className="lg:hidden btn btn-secondary flex items-center space-x-2"
                aria-label={sidebarVisible ? 'Hide filters' : 'Show filters'}
                aria-expanded={sidebarVisible}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" aria-hidden="true" />
                <span>{sidebarVisible ? 'Hide' : 'Filters'}</span>
              </button>
            </div>
          </div>

          {/* Mobile Filters Panel - Appears right under heading */}
          {sidebarVisible && (
            <div className="lg:hidden mb-6 space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters & Searches</h2>
                <button
                  onClick={() => setSidebarVisible(false)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline"
                  aria-label="Hide filters"
                >
                  Hide
                </button>
              </div>
              <TagManager 
                onTagClick={handleTagClick} 
                selectedTags={selectedTags}
                onChanged={() => fetchNotes(1)} 
              />
              <SavedSearchesDashboard />
              <SearchAnalytics />
            </div>
          )}

          {selectedTags.length > 0 && (
            <div className="card mb-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtering by tags:</span>
                  {selectedTags.map((t) => (
                    <span key={t} className="inline-flex items-center bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium">
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  onClick={clearTagFilter}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No notes yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first note.</p>
              <Link to="/notes/new" className="btn btn-primary inline-flex items-center whitespace-nowrap">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Note
              </Link>
            </div>
          ) : (
            <>
              <div 
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                role="list"
                aria-label="Your notes"
              >
                {notes.map((note) => (
                  <article 
                    key={note.id} 
                    className="card hover:shadow-md transition-shadow"
                    role="listitem"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Link 
                        to={`/notes/${note.id}`}
                        className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 truncate flex-1 transition-colors cursor-pointer"
                        aria-label={`View note: ${note.title}`}
                      >
                        {note.title}
                      </Link>
                      <div className="flex space-x-2 ml-2 flex-shrink-0">
                        <Link
                          to={`/notes/${note.id}/edit`}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          aria-label={`Edit ${note.title}`}
                        >
                          <PencilIcon className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <button
                          onClick={() => handleDelete(note.id, note.title)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          aria-label={`Delete ${note.title}`}
                        >
                          <TrashIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        note.note_type === 'text' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {note.note_type === 'text' ? 'Text' : 'Structured'}
                      </span>
                    </div>

                    <div className="prose text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {note.note_type === 'text' 
                        ? note.content?.substring(0, 150) + (note.content?.length > 150 ? '...' : '')
                        : `${Object.keys(note.content || {}).length} sections`
                      }
                    </div>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex items-center space-x-1 mb-3">
                        <TagIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map((tag, index) => (
                            <button
                              key={index}
                              onClick={() => handleTagClick(tag)}
                              className={`inline-block text-xs px-2 py-1 rounded transition-colors ${
                                selectedTags.includes(tag)
                                  ? 'bg-primary-500 text-white dark:bg-primary-600'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300'
                              }`}
                              title={`Filter by "${tag}"`}
                            >
                              {tag}
                            </button>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">+{note.tags.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                      <span>Updated {format(new Date(note.updated_at), 'MMM d, yyyy')}</span>
                    </div>
                  </article>
                ))}
              </div>

              {pagination.total > pagination.per_page && (
                <nav 
                  className="flex justify-center items-center space-x-2"
                  role="navigation"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.has_prev}
                    className="btn btn-secondary disabled:opacity-50"
                    aria-label="Go to previous page"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700 dark:text-gray-300" aria-current="page">
                    Page {pagination.page} of {Math.ceil(pagination.total / pagination.per_page)}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.has_next}
                    className="btn btn-secondary disabled:opacity-50"
                    aria-label="Go to next page"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </main>

        {/* Sidebar - Desktop only (left side) */}
        <aside 
          className="hidden lg:block lg:col-span-1 lg:order-1"
          role="complementary"
          aria-label="Sidebar with filters and analytics"
        >
          <div className="lg:sticky lg:top-4 space-y-4">
            <TagManager 
              onTagClick={handleTagClick} 
              selectedTags={selectedTags}
              onChanged={() => fetchNotes(1)} 
            />
            <SavedSearchesDashboard />
            <SearchAnalytics />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default DashboardPage
