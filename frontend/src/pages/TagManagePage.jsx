import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { tagsAPI } from '../services/api'
import { useNotesStore } from '../store/notesStore'

const TagManagePage = () => {
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sourceId, setSourceId] = useState('')
  const [targetId, setTargetId] = useState('')
  const navigate = useNavigate()

  const loadTags = async () => {
    try {
      const res = await tagsAPI.list()
      setTags(res.data.tags || [])
    } catch (e) {
      setError('Failed to load tags')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTags() }, [])

  const merge = async () => {
    if (!sourceId || !targetId || sourceId === targetId) return
    try {
      await tagsAPI.merge(Number(sourceId), Number(targetId))
      setSourceId('')
      setTargetId('')
      await loadTags()
      // Optional: refresh current notes so counts/tags update
      try { useNotesStore.getState().fetchNotes(1) } catch {}
      alert('Tags merged successfully')
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to merge')
    }
  }

  if (loading) return <p>Loading…</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Manage Tags</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>

      <div className="card p-4 mb-6">
        <h2 className="font-medium mb-3">Merge Tags</h2>
        <div className="flex items-center gap-2">
          <select className="input" value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
            <option value="">Source tag…</option>
            {tags.map(t => <option key={t.id} value={t.id}>#{t.name}</option>)}
          </select>
          <span className="text-sm text-gray-500">into</span>
          <select className="input" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            <option value="">Target tag…</option>
            {tags.map(t => <option key={t.id} value={t.id}>#{t.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={merge} disabled={!sourceId || !targetId || sourceId === targetId}>Merge</button>
        </div>
        <p className="text-xs text-gray-500 mt-2">All notes with the source tag will be updated to the target tag. The source tag will be deleted.</p>
      </div>

      <div className="card p-4">
        <h2 className="font-medium mb-3">All Tags</h2>
        <ul className="space-y-1">
          {tags.map(t => (
            <li key={t.id} className="text-sm text-gray-700 dark:text-gray-300">#{t.name} <span className="text-gray-400">({t.note_count})</span></li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default TagManagePage
