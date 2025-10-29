import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNotesStore } from '../store/notesStore'
import { useToast } from '../components/ToastContainer'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import ReactMarkdown from 'react-markdown'
import TagInput from '../components/TagInput'
import { 
  EyeIcon, 
  PencilIcon, 
  PlusIcon, 
  TrashIcon,
  DocumentTextIcon,
  RectangleStackIcon 
} from '@heroicons/react/24/outline'

const schema = yup.object({
  title: yup.string().required('Title is required').max(200, 'Title must be less than 200 characters'),
  note_type: yup.string().oneOf(['text', 'structured']).required(),
  content: yup.mixed().required('Content is required'),
  tags: yup.string(),
})

const NoteEditorPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const { showToast } = useToast()
  const formRef = useRef(null)
  
  const { 
    currentNote, 
    isLoading, 
    createNote, 
    updateNote, 
    fetchNote, 
    clearCurrentNote 
  } = useNotesStore()

  const [noteType, setNoteType] = useState('text')
  const [previewMode, setPreviewMode] = useState(false)
  const [structuredContent, setStructuredContent] = useState({})
  const [tags, setTags] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      note_type: 'text',
      content: '',
      tags: '',
    },
  })

  const watchedContent = watch('content')

  // Keyboard shortcuts for editor
  useKeyboardShortcuts({
    onSave: () => {
      if (formRef.current) {
        formRef.current.requestSubmit()
      }
    },
    disabled: previewMode // Disable save shortcut in preview mode
  })

  useEffect(() => {
    if (isEditing && id) {
      fetchNote(id)
    } else {
      clearCurrentNote()
    }

    return () => {
      clearCurrentNote()
    }
  }, [id, isEditing, fetchNote, clearCurrentNote])

  useEffect(() => {
    if (currentNote && isEditing) {
      reset({
        title: currentNote.title,
        note_type: currentNote.note_type,
        content: currentNote.note_type === 'text' 
          ? currentNote.content 
          : JSON.stringify(currentNote.content, null, 2),
        tags: currentNote.tags ? currentNote.tags.join(', ') : '',
      })
      setNoteType(currentNote.note_type)
      setTags(currentNote.tags || [])
      if (currentNote.note_type === 'structured') {
        setStructuredContent(currentNote.content || {})
      }
    }
  }, [currentNote, isEditing, reset])

  const onSubmit = async (data) => {
    let processedContent = data.content
    
    if (noteType === 'structured') {
      try {
        processedContent = JSON.parse(data.content)
      } catch (error) {
        // If JSON parsing fails, treat as key-value pairs
        const lines = data.content.split('\n').filter(line => line.trim())
        processedContent = {}
        lines.forEach(line => {
          const [key, ...valueParts] = line.split(':')
          if (key && valueParts.length > 0) {
            processedContent[key.trim()] = valueParts.join(':').trim()
          }
        })
      }
    }

    const noteData = {
      title: data.title,
      note_type: noteType,
      content: processedContent,
      tags: tags,
    }

    let result
    if (isEditing) {
      result = await updateNote(id, noteData)
      if (result) {
        showToast('Note updated successfully', 'success')
      } else {
        showToast('Failed to update note', 'error')
      }
    } else {
      result = await createNote(noteData)
      if (result) {
        showToast('Note created successfully', 'success')
      } else {
        showToast('Failed to create note', 'error')
      }
    }

    if (result) {
      navigate('/dashboard')
    }
  }

  const handleNoteTypeChange = (newType) => {
    setNoteType(newType)
    setValue('note_type', newType)
    
    if (newType === 'structured' && typeof watchedContent === 'string') {
      // Convert text content to structured format
      const lines = watchedContent.split('\n').filter(line => line.trim())
      const structured = {}
      
      if (lines.length > 0) {
        lines.forEach((line, index) => {
          const [key, ...valueParts] = line.split(':')
          if (key && valueParts.length > 0) {
            structured[key.trim()] = valueParts.join(':').trim()
          } else {
            structured[`Section ${index + 1}`] = line.trim()
          }
        })
      }
      
      setStructuredContent(structured)
      setValue('content', JSON.stringify(structured, null, 2))
    } else if (newType === 'text') {
      // Convert structured content to text
      try {
        const obj = typeof watchedContent === 'string' ? JSON.parse(watchedContent) : watchedContent
        
        // Check if the object is empty or has no entries
        if (!obj || Object.keys(obj).length === 0) {
          setValue('content', '')
        } else {
          const textContent = Object.entries(obj).map(([key, value]) => `${key}: ${value}`).join('\n')
          setValue('content', textContent)
        }
      } catch (error) {
        setValue('content', '')
      }
    } else if (newType === 'structured' && !watchedContent) {
      // Initialize empty structured content
      setStructuredContent({})
      setValue('content', JSON.stringify({}, null, 2))
    }
  }

  const addStructuredSection = () => {
    const newSection = `Section ${Object.keys(structuredContent).length + 1}`
    const updated = { ...structuredContent, [newSection]: '' }
    setStructuredContent(updated)
    setValue('content', JSON.stringify(updated, null, 2))
  }

  const removeStructuredSection = (key) => {
    const updated = { ...structuredContent }
    delete updated[key]
    setStructuredContent(updated)
    setValue('content', JSON.stringify(updated, null, 2))
  }

  const updateStructuredSection = (oldKey, newKey, value) => {
    const updated = { ...structuredContent }
    if (oldKey !== newKey) {
      delete updated[oldKey]
    }
    updated[newKey] = value
    setStructuredContent(updated)
    setValue('content', JSON.stringify(updated, null, 2))
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {isEditing ? 'Edit Note' : 'Create New Note'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isEditing ? 'Update your note content and settings. Press Ctrl+S to save.' : 'Choose between simple text or structured content. Press Ctrl+S to save.'}
        </p>
      </div>

      <form 
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-6"
        aria-label={isEditing ? 'Edit note form' : 'Create note form'}
      >
        {/* Title */}
        <div className="card">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            {...register('title')}
            type="text"
            id="title"
            className={`input ${errors.title ? 'border-red-500 dark:border-red-400' : ''}`}
            placeholder="Enter note title"
            aria-required="true"
            aria-invalid={errors.title ? 'true' : 'false'}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          {errors.title && (
            <p id="title-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Note Type Selection */}
        <div className="card">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Note Type
            </legend>
            <div className="flex space-x-4" role="group" aria-label="Note type selection">
              <button
                type="button"
                onClick={() => handleNoteTypeChange('text')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  noteType === 'text'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                aria-pressed={noteType === 'text'}
                aria-label="Text note type"
              >
                <DocumentTextIcon className="h-5 w-5" aria-hidden="true" />
                <span>Text Note</span>
              </button>
              <button
                type="button"
                onClick={() => handleNoteTypeChange('structured')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  noteType === 'structured'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                aria-pressed={noteType === 'structured'}
                aria-label="Structured note type"
              >
                <RectangleStackIcon className="h-5 w-5" aria-hidden="true" />
                <span>Structured Note</span>
              </button>
            </div>
          </fieldset>
        </div>

        {/* Content Editor */}
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Content *
            </label>
            {noteType === 'text' && (
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                aria-label={previewMode ? 'Switch to edit mode' : 'Preview markdown'}
              >
                {previewMode ? (
                  <>
                    <PencilIcon className="h-4 w-4" aria-hidden="true" />
                    <span>Edit</span>
                  </>
                ) : (
                  <>
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                    <span>Preview</span>
                  </>
                )}
              </button>
            )}
          </div>

          {noteType === 'text' ? (
            previewMode ? (
              <div 
                className="prose max-w-none p-4 border border-gray-200 dark:border-gray-700 rounded-lg min-h-48 bg-gray-50 dark:bg-gray-900"
                role="region"
                aria-label="Markdown preview"
              >
                <ReactMarkdown>{watchedContent || 'Nothing to preview...'}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                {...register('content')}
                id="content"
                rows={12}
                className={`input resize-y ${errors.content ? 'border-red-500 dark:border-red-400' : ''}`}
                placeholder="Write your note in Markdown..."
                aria-required="true"
                aria-invalid={errors.content ? 'true' : 'false'}
                aria-describedby={errors.content ? 'content-error' : undefined}
              />
            )
          ) : (
            <div className="space-y-4" role="region" aria-label="Structured content editor">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create sections with key-value pairs
                </p>
                <button
                  type="button"
                  onClick={addStructuredSection}
                  className="flex items-center space-x-1 text-sm btn btn-secondary"
                  aria-label="Add new section"
                >
                  <PlusIcon className="h-4 w-4" aria-hidden="true" />
                  <span>Add Section</span>
                </button>
              </div>
              
              {Object.keys(structuredContent).length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                  <RectangleStackIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" aria-hidden="true" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No sections yet</p>
                  <button
                    type="button"
                    onClick={addStructuredSection}
                    className="btn btn-primary inline-flex items-center"
                    aria-label="Add your first section"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    Add Your First Section
                  </button>
                </div>
              ) : (
                Object.entries(structuredContent).map(([key, value], index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
                    role="group"
                    aria-label={`Section ${index + 1}: ${key}`}
                  >
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => updateStructuredSection(key, e.target.value, value)}
                        className="input flex-1 font-medium"
                        placeholder="Section title"
                        aria-label={`Section ${index + 1} title`}
                      />
                      <button
                        type="button"
                        onClick={() => removeStructuredSection(key)}
                        className="ml-3 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        aria-label={`Remove section ${key}`}
                      >
                        <TrashIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                    <textarea
                      value={value}
                      onChange={(e) => updateStructuredSection(key, key, e.target.value)}
                      className="input w-full resize-y"
                      rows={4}
                      placeholder="Section content (Markdown supported)"
                      aria-label={`Section ${index + 1} content`}
                    />
                  </div>
                ))
              )}
              
              <textarea
                {...register('content')}
                className="hidden"
                readOnly
                aria-hidden="true"
              />
            </div>
          )}
          
          {errors.content && (
            <p id="content-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.content.message}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <TagInput 
            tags={tags}
            onChange={setTags}
            placeholder="Add tags (e.g., work, important, project)..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
            aria-label="Cancel and return to dashboard"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            aria-label={isEditing ? 'Update note (Ctrl+S or Cmd+S)' : 'Create note (Ctrl+S or Cmd+S)'}
          >
            {isLoading 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Note' : 'Create Note')
            }
          </button>
        </div>
      </form>
    </div>
  )
}

export default NoteEditorPage