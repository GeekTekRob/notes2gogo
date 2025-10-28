import { create } from 'zustand';
import api from '../services/api';

const useSearchStore = create((set, get) => ({
  // Search state
  query: '',
  filters: {
    tags: [],
    tagMode: 'and',
    excludeTags: [],
    noteType: null,
    createdAfter: null,
    createdBefore: null,
    updatedAfter: null,
    updatedBefore: null,
    titleOnly: false,
    hasAttachments: null,
  },
  sortBy: 'relevance',
  
  // Results state
  results: [],
  total: 0,
  page: 1,
  perPage: 20,
  hasNext: false,
  hasPrev: false,
  executionTimeMs: 0,
  
  // UI state
  isLoading: false,
  error: null,
  isAdvancedFiltersOpen: false,
  
  // Saved searches state
  savedSearches: [],
  isSavedSearchesLoading: false,
  
  // Search highlighting
  highlightTerms: [],

  // Actions
  setQuery: (query) => set({ query }),
  
  setFilter: (filterName, value) => set((state) => ({
    filters: {
      ...state.filters,
      [filterName]: value,
    },
  })),

  // Set multiple filters at once (merge)
  setFilters: (newFilters) => set((state) => ({
    filters: {
      ...state.filters,
      ...newFilters,
    },
  })),
  
  resetFilters: () => set({
    filters: {
      tags: [],
      tagMode: 'and',
      excludeTags: [],
      noteType: null,
      createdAfter: null,
      createdBefore: null,
      updatedAfter: null,
      updatedBefore: null,
      titleOnly: false,
      hasAttachments: null,
    },
  }),
  
  setSortBy: (sortBy) => set({ sortBy }),
  
  setPage: (page) => set({ page }),
  
  toggleAdvancedFilters: () => set((state) => ({
    isAdvancedFiltersOpen: !state.isAdvancedFiltersOpen,
  })),
  
  // Perform search
  search: async (pageOverride = null) => {
    const state = get();
    const searchPage = pageOverride !== null ? pageOverride : state.page;
    
    set({ isLoading: true, error: null });
    
    try {
      const searchRequest = {
        query: state.query,
        tags: state.filters.tags.length > 0 ? state.filters.tags : null,
        tag_mode: state.filters.tagMode,
        exclude_tags: state.filters.excludeTags.length > 0 ? state.filters.excludeTags : null,
        note_type: state.filters.noteType,
        created_after: state.filters.createdAfter,
        created_before: state.filters.createdBefore,
        updated_after: state.filters.updatedAfter,
        updated_before: state.filters.updatedBefore,
        title_only: state.filters.titleOnly,
        has_attachments: state.filters.hasAttachments,
        sort_by: state.sortBy,
        page: searchPage,
        per_page: state.perPage,
      };
      
      const response = await api.post('/api/search', searchRequest);
      
      // Extract search terms for highlighting
      const terms = state.query
        .split(/\s+/)
        .filter(term => !term.match(/^(intitle:|tag:|-tag:|created:|updated:|has:|todo:)/i))
        .map(term => term.replace(/['"]/g, ''));
      
      set({
        results: response.data.results,
        total: response.data.total,
        page: response.data.page,
        perPage: response.data.per_page,
        hasNext: response.data.has_next,
        hasPrev: response.data.has_prev,
        executionTimeMs: response.data.execution_time_ms,
        highlightTerms: terms,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Search failed',
        results: [],
        total: 0,
      });
    }
  },
  
  // Clear search
  clearSearch: () => set({
    query: '',
    results: [],
    total: 0,
    page: 1,
    hasNext: false,
    hasPrev: false,
    executionTimeMs: 0,
    error: null,
    highlightTerms: [],
  }),
  
  // Saved searches
  fetchSavedSearches: async () => {
    set({ isSavedSearchesLoading: true });
    
    try {
      const response = await api.get('/api/search/saved');
      set({
        savedSearches: response.data.saved_searches,
        isSavedSearchesLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch saved searches:', error);
      set({ isSavedSearchesLoading: false });
    }
  },
  
  saveSearch: async (name) => {
    const state = get();
    
    try {
      const savedSearchData = {
        name,
        search_query: {
          query: state.query,
          tags: state.filters.tags.length > 0 ? state.filters.tags : null,
          tag_mode: state.filters.tagMode,
          exclude_tags: state.filters.excludeTags.length > 0 ? state.filters.excludeTags : null,
          note_type: state.filters.noteType,
          created_after: state.filters.createdAfter,
          created_before: state.filters.createdBefore,
          updated_after: state.filters.updatedAfter,
          updated_before: state.filters.updatedBefore,
          title_only: state.filters.titleOnly,
          has_attachments: state.filters.hasAttachments,
          sort_by: state.sortBy,
          page: 1,
          per_page: state.perPage,
        },
      };
      
      const response = await api.post('/api/search/saved', savedSearchData);
      
      // Refresh saved searches list
      await get().fetchSavedSearches();
      
      return response.data;
    } catch (error) {
      console.error('Failed to save search:', error);
      throw error;
    }
  },
  
  loadSavedSearch: (savedSearch) => {
    const searchQuery = savedSearch.search_query;
    
    set({
      query: searchQuery.query || '',
      filters: {
        tags: searchQuery.tags || [],
        tagMode: searchQuery.tag_mode || 'and',
        excludeTags: searchQuery.exclude_tags || [],
        noteType: searchQuery.note_type || null,
        createdAfter: searchQuery.created_after || null,
        createdBefore: searchQuery.created_before || null,
        updatedAfter: searchQuery.updated_after || null,
        updatedBefore: searchQuery.updated_before || null,
        titleOnly: searchQuery.title_only || false,
        hasAttachments: searchQuery.has_attachments || null,
      },
      sortBy: searchQuery.sort_by || 'relevance',
      page: 1,
    });
  },
  
  executeSavedSearch: async (savedSearchId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post(`/api/search/saved/${savedSearchId}/execute`);
      
      set({
        results: response.data.results,
        total: response.data.total,
        page: response.data.page,
        perPage: response.data.per_page,
        hasNext: response.data.has_next,
        hasPrev: response.data.has_prev,
        executionTimeMs: response.data.execution_time_ms,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.detail || 'Failed to execute saved search',
      });
    }
  },
  
  deleteSavedSearch: async (savedSearchId) => {
    try {
      await api.delete(`/api/search/saved/${savedSearchId}`);
      
      // Refresh saved searches list
      await get().fetchSavedSearches();
    } catch (error) {
      console.error('Failed to delete saved search:', error);
      throw error;
    }
  },
}));

export default useSearchStore;
