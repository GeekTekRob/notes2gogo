import { create } from 'zustand'
import { notesAPI } from '../services/api'
import toast from 'react-hot-toast'

export const useNotesStore = create((set, get) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  pagination: {
    page: 1,
    per_page: 10,
    total: 0,
    has_next: false,
    has_prev: false,
  },
  filters: {
    search: '',
    note_type: null,
    tags: '',
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 },
    }))
  },

  fetchNotes: async (page = 1) => {
    set({ isLoading: true })
    try {
      const { filters } = get()
      const params = {
        page,
        per_page: get().pagination.per_page,
        ...filters,
      }
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key]
        }
      })

      const response = await notesAPI.getNotes(params)
      const { notes, total, has_next, has_prev, per_page } = response.data

      set({
        notes,
        pagination: {
          page,
          per_page,
          total,
          has_next,
          has_prev,
        },
        isLoading: false,
      })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Failed to fetch notes')
    }
  },

  fetchNote: async (id) => {
    set({ isLoading: true })
    try {
      const response = await notesAPI.getNote(id)
      set({
        currentNote: response.data,
        isLoading: false,
      })
      return response.data
    } catch (error) {
      set({ isLoading: false })
      toast.error('Failed to fetch note')
      return null
    }
  },

  createNote: async (noteData) => {
    set({ isLoading: true })
    try {
      const response = await notesAPI.createNote(noteData)
      set({ isLoading: false })
      toast.success('Note created successfully!')
      
      // Refresh notes list
      get().fetchNotes(get().pagination.page)
      
      return response.data
    } catch (error) {
      set({ isLoading: false })
      const message = error.response?.data?.detail || 'Failed to create note'
      toast.error(message)
      return null
    }
  },

  updateNote: async (id, noteData) => {
    set({ isLoading: true })
    try {
      const response = await notesAPI.updateNote(id, noteData)
      set({ isLoading: false })
      toast.success('Note updated successfully!')
      
      // Update current note if it's the one being edited
      if (get().currentNote?.id === id) {
        set({ currentNote: response.data })
      }
      
      // Refresh notes list
      get().fetchNotes(get().pagination.page)
      
      return response.data
    } catch (error) {
      set({ isLoading: false })
      const message = error.response?.data?.detail || 'Failed to update note'
      toast.error(message)
      return null
    }
  },

  deleteNote: async (id) => {
    try {
      await notesAPI.deleteNote(id)
      toast.success('Note deleted successfully!')
      
      // Remove from local state
      set((state) => ({
        notes: state.notes.filter(note => note.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote,
      }))
      
      // Refresh notes list to get accurate pagination
      get().fetchNotes(get().pagination.page)
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to delete note'
      toast.error(message)
    }
  },

  clearCurrentNote: () => {
    set({ currentNote: null })
  },
}))