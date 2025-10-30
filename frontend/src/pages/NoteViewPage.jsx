import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useNotesStore } from '../store/notesStore'
import { notesAPI } from '../services/api'
import ReactMarkdown from 'react-markdown'
import { 
  PencilIcon, 
  TrashIcon,
  ArrowLeftIcon,
  TagIcon,
  CalendarIcon,
  DocumentTextIcon,
  RectangleStackIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'

// Component to highlight search terms in text
const HighlightedText = ({ text, searchTerms }) => {
  if (!searchTerms || searchTerms.length === 0) {
    return <span>{text}</span>;
  }

  // Create regex pattern for all search terms
  const pattern = searchTerms
    .filter(term => term && term.length > 0)
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special chars
    .join('|');

  if (!pattern) return <span>{text}</span>;

  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) => {
        const isHighlighted = regex.test(part);
        return isHighlighted ? (
          <mark
            key={index}
            className="bg-yellow-200 dark:bg-yellow-600 px-1 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};

// Custom ReactMarkdown component that highlights search terms
const MarkdownWithHighlight = ({ children, searchTerms }) => {
  const components = useMemo(() => ({
    p: ({ children, ...props }) => {
      if (typeof children === 'string') {
        return <p {...props}><HighlightedText text={children} searchTerms={searchTerms} /></p>;
      }
      return <p {...props}>{children}</p>;
    },
    li: ({ children, ...props }) => {
      if (typeof children === 'string') {
        return <li {...props}><HighlightedText text={children} searchTerms={searchTerms} /></li>;
      }
      return <li {...props}>{children}</li>;
    },
    h1: ({ children, ...props }) => {
      if (typeof children === 'string') {
        return <h1 {...props}><HighlightedText text={children} searchTerms={searchTerms} /></h1>;
      }
      return <h1 {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }) => {
      if (typeof children === 'string') {
        return <h2 {...props}><HighlightedText text={children} searchTerms={searchTerms} /></h2>;
      }
      return <h2 {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }) => {
      if (typeof children === 'string') {
        return <h3 {...props}><HighlightedText text={children} searchTerms={searchTerms} /></h3>;
      }
      return <h3 {...props}>{children}</h3>;
    },
    strong: ({ children, ...props }) => {
      if (typeof children === 'string') {
        return <strong {...props}><HighlightedText text={children} searchTerms={searchTerms} /></strong>;
      }
      return <strong {...props}>{children}</strong>;
    },
    em: ({ children, ...props }) => {
      if (typeof children === 'string') {
        return <em {...props}><HighlightedText text={children} searchTerms={searchTerms} /></em>;
      }
      return <em {...props}>{children}</em>;
    },
  }), [searchTerms]);

  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
};

const NoteViewPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  
  const { 
    currentNote, 
    isLoading, 
    fetchNote, 
    deleteNote,
    clearCurrentNote 
  } = useNotesStore()

  // Extract search terms from URL params
  const searchTerms = useMemo(() => {
    const query = searchParams.get('q') || '';
    const highlight = searchParams.get('highlight') || '';
    
    // Parse query for search terms
    const terms = [];
    
    if (query) {
      // Extract words from query, removing operators
      const words = query
        .replace(/intitle:|tag:|created:|updated:|has:|todo:/gi, '')
        .replace(/["()]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !['and', 'or', 'not', 'near'].includes(w.toLowerCase()));
      terms.push(...words);
    }
    
    if (highlight) {
      // Additional terms to highlight
      terms.push(...highlight.split(',').map(t => t.trim()));
    }
    
    return [...new Set(terms)]; // Remove duplicates
  }, [searchParams]);

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

  const handleExportPDF = async (paperSize = 'letter', orientation = 'portrait') => {
    try {
      setIsExporting(true)
      setShowExportMenu(false)
      
      const response = await notesAPI.exportToPdf(id, { 
        paper_size: paperSize,
        orientation: orientation
      })
      
      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/pdf' })
      
      // Extract filename from Content-Disposition header or generate one
      const contentDisposition = response.headers['content-disposition']
      let filename = `note-${id}.pdf`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Failed to export PDF:', error)
      alert('Failed to export note as PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportMarkdown = async () => {
    try {
      setIsExporting(true)
      setShowExportMenu(false)
      
      const response = await notesAPI.exportToMarkdown(id)
      
      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'text/markdown' })
      
      // Extract filename from Content-Disposition header or generate one
      const contentDisposition = response.headers['content-disposition']
      let filename = `note-${id}.md`
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Failed to export Markdown:', error)
      alert('Failed to export note as Markdown. Please try again.')
    } finally {
      setIsExporting(false)
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
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="btn btn-secondary inline-flex items-center"
              title="Export note"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            </button>
            
            {showExportMenu && (
              <>
                {/* Backdrop to close menu */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowExportMenu(false)}
                />
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1" role="menu">
                    {/* PDF Export Options */}
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Export as PDF
                    </div>
                    <button
                      onClick={() => handleExportPDF('letter', 'portrait')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      role="menuitem"
                    >
                      📄 PDF (Letter, Portrait)
                    </button>
                    <button
                      onClick={() => handleExportPDF('letter', 'landscape')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      role="menuitem"
                    >
                      📄 PDF (Letter, Landscape)
                    </button>
                    <button
                      onClick={() => handleExportPDF('a4', 'portrait')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      role="menuitem"
                    >
                      📄 PDF (A4, Portrait)
                    </button>
                    <button
                      onClick={() => handleExportPDF('a4', 'landscape')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      role="menuitem"
                    >
                      📄 PDF (A4, Landscape)
                    </button>
                    
                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    
                    {/* Markdown Export */}
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Export as Markdown
                    </div>
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      role="menuitem"
                    >
                      📝 Markdown (.md)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          
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
              <HighlightedText text={currentNote.title} searchTerms={searchTerms} />
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
                  <Link
                    key={index}
                    to={`/dashboard?tag=${encodeURIComponent(tag)}`}
                    className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-3 py-1 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    title={`View all notes with "${tag}"`}
                  >
                    {tag}
                  </Link>
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
        {searchTerms.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Highlighting search terms: <span className="font-medium">{searchTerms.join(', ')}</span>
            </p>
          </div>
        )}
        
        {currentNote.note_type === 'text' ? (
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <MarkdownWithHighlight searchTerms={searchTerms}>
              {currentNote.content || 'No content'}
            </MarkdownWithHighlight>
          </div>
        ) : (
          <div className="space-y-6">
            {currentNote.content && Object.keys(currentNote.content).length > 0 ? (
              Object.entries(currentNote.content).map(([key, value], index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    <HighlightedText text={key} searchTerms={searchTerms} />
                  </h2>
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <MarkdownWithHighlight searchTerms={searchTerms}>
                      {value || 'No content'}
                    </MarkdownWithHighlight>
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
