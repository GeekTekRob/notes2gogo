import { useState, useEffect } from 'react'
import { TagIcon, PencilIcon, TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'
import api, { tagsAPI } from '../services/api'

const TagManager = ({ onTagClick, selectedTags = [], onChanged }) => {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingTagId, setEditingTagId] = useState(null)
  const [editingTagName, setEditingTagName] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Fetch all tags
  const fetchTags = async () => {
    try {
  const response = await tagsAPI.list()
      setTags(response.data.tags || [])
    } catch (error) {
      console.error('Error fetching tags:', error)
      setError('Failed to load tags')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  // Handle tag rename
  const handleRenameTag = async (tagId) => {
    if (!editingTagName.trim()) {
      setEditingTagId(null)
      return
    }

    try {
      const response = await tagsAPI.update(tagId, { name: editingTagName.trim() })
      if (response.status === 200) {
        await fetchTags()
        onChanged?.('rename')
        setEditingTagId(null)
        setEditingTagName('')
      } else {
        alert(response.data?.detail || 'Failed to rename tag')
      }
    } catch (error) {
      console.error('Error renaming tag:', error)
      const message = error.response?.data?.detail || 'Failed to rename tag'
      alert(message)
    }
  }

  // Handle tag delete
  const handleDeleteTag = async (tagId, tagName) => {
    if (!confirm(`Are you sure you want to delete the tag "${tagName}"? It will be removed from all notes.`)) {
      return
    }

    try {
      const response = await tagsAPI.remove(tagId)
      if (response.status === 200 || response.status === 204) {
        await fetchTags()
        onChanged?.('delete')
      } else {
        alert(response.data?.detail || 'Failed to delete tag')
      }
    } catch (error) {
      console.error('Error deleting tag:', error)
      const message = error.response?.data?.detail || 'Failed to delete tag'
      alert(message)
    }
  }

  // Start editing a tag
  const startEditing = (tag) => {
    setEditingTagId(tag.id)
    setEditingTagName(tag.name)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingTagId(null)
    setEditingTagName('')
  }

  // Advanced actions moved to dedicated page

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <TagIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Tags</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading tags...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <TagIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Tags</h3>
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TagIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Tags</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
          </span>
          <button
            onClick={() => navigate('/tags/manage')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            title="Advanced tag management"
          >
            Manage
          </button>
        </div>
      </div>


      {tags.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No tags yet. Create a note with tags to get started.
        </p>
      ) : (
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className={`group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedTags.includes(tag.name) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              {editingTagId === tag.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editingTagName}
                    onChange={(e) => setEditingTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameTag(tag.id)
                      if (e.key === 'Escape') cancelEditing()
                    }}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRenameTag(tag.id)}
                    className="p-1 text-green-600 hover:text-green-700 dark:text-green-400"
                    title="Save"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    title="Cancel"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onTagClick && onTagClick(tag.name)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      #{tag.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                      {tag.note_count}
                    </span>
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditing(tag)}
                      className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      title="Rename tag"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id, tag.name)}
                      className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                      title="Delete tag"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TagManager
