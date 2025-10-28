import { useState, useEffect } from 'react';
import { 
  BookmarkIcon, 
  PlusIcon, 
  TrashIcon, 
  PlayIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import api from '../services/api';
import useSearchStore from '../store/searchStore';
import { useNavigate } from 'react-router-dom';

const SavedSearches = () => {
  const navigate = useNavigate();
  const store = useSearchStore();
  const { query, filters, sortBy, setQuery, setFilters, setSortBy, search } = store;
  
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    try {
      setLoading(true);
      setError(null);
  const response = await api.get('/api/search/saved');
      setSavedSearches(response.data.saved_searches);
    } catch (err) {
      console.error('Error loading saved searches:', err);
      setError('Failed to load saved searches');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrentSearch = async () => {
    if (!saveName.trim()) {
      alert('Please enter a name for this search');
      return;
    }

    try {
      // Build search request from current state
      const searchRequest = {
        query: query || '',
        tags: filters.tags || [],
        tag_mode: filters.tagMode || 'and',
        exclude_tags: filters.excludeTags || [],
        note_type: filters.noteType || null,
        created_after: filters.createdAfter || null,
        created_before: filters.createdBefore || null,
        updated_after: filters.updatedAfter || null,
        updated_before: filters.updatedBefore || null,
        title_only: filters.titleOnly || false,
        sort_by: sortBy || 'relevance',
        page: 1,
        per_page: 20
      };

      await api.post('/api/search/saved', {
        name: saveName,
        search_query: searchRequest
      });

      setSaveName('');
      setShowSaveDialog(false);
      await loadSavedSearches();
    } catch (err) {
      console.error('Error saving search:', err);
      alert('Failed to save search');
    }
  };

  const handleExecuteSavedSearch = async (savedSearch) => {
    try {
      // Execute the saved search and update stats
  const response = await api.post(`/api/search/saved/${savedSearch.id}/execute`);
      
      // Load the search parameters
      const searchParams = savedSearch.search_query;
      
      setQuery(searchParams.query || '');
      setFilters({
        tags: searchParams.tags || [],
        tagMode: searchParams.tag_mode || 'and',
        excludeTags: searchParams.exclude_tags || [],
        noteType: searchParams.note_type || null,
        createdAfter: searchParams.created_after || null,
        createdBefore: searchParams.created_before || null,
        updatedAfter: searchParams.updated_after || null,
        updatedBefore: searchParams.updated_before || null,
        titleOnly: searchParams.title_only || false,
      });
      setSortBy(searchParams.sort_by || 'relevance');
      
      // Navigate to search results and perform search
      navigate('/search');
      await search(1);
      
      // Reload saved searches to update use count
      await loadSavedSearches();
    } catch (err) {
      console.error('Error executing saved search:', err);
      alert('Failed to execute search');
    }
  };

  const handleDeleteSavedSearch = async (id) => {
    if (!confirm('Are you sure you want to delete this saved search?')) {
      return;
    }

    try {
  await api.delete(`/api/search/saved/${id}`);
      await loadSavedSearches();
    } catch (err) {
      console.error('Error deleting saved search:', err);
      alert('Failed to delete search');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatSearchQuery = (searchQuery) => {
    const parts = [];
    
    if (searchQuery.query) {
      parts.push(`"${searchQuery.query}"`);
    }
    
    if (searchQuery.tags && searchQuery.tags.length > 0) {
      parts.push(`Tags: ${searchQuery.tags.join(', ')}`);
    }
    
    if (searchQuery.exclude_tags && searchQuery.exclude_tags.length > 0) {
      parts.push(`Exclude: ${searchQuery.exclude_tags.join(', ')}`);
    }
    
    if (searchQuery.note_type) {
      parts.push(`Type: ${searchQuery.note_type}`);
    }
    
    return parts.join(' · ') || 'Empty search';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <BookmarkSolidIcon className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
          Saved Searches
        </h2>
        
        <button
          onClick={() => setShowSaveDialog(true)}
          className="flex items-center px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 
                   text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Save Current Search
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : savedSearches.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <BookmarkIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No saved searches yet</p>
          <p className="text-sm mt-1">Save your frequently used searches for quick access</p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedSearches.map((savedSearch) => (
            <div
              key={savedSearch.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 
                       rounded-lg border border-gray-200 dark:border-gray-700 
                       hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {savedSearch.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {formatSearchQuery(savedSearch.search_query)}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Used {savedSearch.use_count} times</span>
                  {savedSearch.last_used_at && (
                    <span>Last used: {formatDate(savedSearch.last_used_at)}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleExecuteSavedSearch(savedSearch)}
                  className="p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 
                           dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 
                           rounded transition-colors"
                  title="Execute search"
                >
                  <PlayIcon className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => handleDeleteSavedSearch(savedSearch.id)}
                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 
                           dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 
                           rounded transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Save Current Search
              </h3>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveName('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Name
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., Work meetings this week"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveCurrentSearch();
                  }
                }}
              />
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Current search:
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatSearchQuery({
                  query,
                  tags: filters.tags,
                  exclude_tags: filters.excludeTags,
                  note_type: filters.noteType
                })}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveName('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                         text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                         dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCurrentSearch}
                disabled={!saveName.trim()}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white 
                         rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedSearches;
