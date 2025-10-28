import { useState, useEffect } from 'react';
import { 
  BookmarkIcon, 
  PlayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useSearchStore from '../store/searchStore';

const SavedSearchesDashboard = () => {
  const navigate = useNavigate();
  const { setQuery, setFilters, setSortBy, search } = useSearchStore();
  
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/search/saved');
      setSavedSearches(response.data.saved_searches || []);
    } catch (err) {
      console.error('Error loading saved searches:', err);
      setError('Failed to load saved searches');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSavedSearch = async (savedSearch) => {
    try {
      // Execute the saved search and update stats
      await api.post(`/api/search/saved/${savedSearch.id}/execute`);
      
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

  const handleDeleteSavedSearch = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
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

  const formatSearchQuery = (searchQuery) => {
    const parts = [];
    
    if (searchQuery.query) {
      parts.push(`"${searchQuery.query}"`);
    }
    
    if (searchQuery.tags && searchQuery.tags.length > 0) {
      parts.push(`Tags: ${searchQuery.tags.slice(0, 2).join(', ')}${searchQuery.tags.length > 2 ? '...' : ''}`);
    }
    
    if (searchQuery.exclude_tags && searchQuery.exclude_tags.length > 0) {
      parts.push(`Exclude: ${searchQuery.exclude_tags.slice(0, 1).join(', ')}${searchQuery.exclude_tags.length > 1 ? '...' : ''}`);
    }
    
    if (searchQuery.note_type) {
      parts.push(`Type: ${searchQuery.note_type}`);
    }
    
    return parts.join(' · ') || 'Empty search';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <BookmarkSolidIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Saved Searches</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <BookmarkSolidIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Saved Searches</h3>
        </div>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookmarkSolidIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Saved Searches</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {savedSearches.length} {savedSearches.length === 1 ? 'search' : 'searches'}
          </span>
          <button
            onClick={() => navigate('/search')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            title="Go to advanced search"
          >
            Search
          </button>
        </div>
      </div>

      {savedSearches.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No saved searches yet. Use the search page to save frequently used searches.
        </p>
      ) : (
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {savedSearches.map((savedSearch) => (
            <div
              key={savedSearch.id}
              className="group flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <button
                onClick={() => handleExecuteSavedSearch(savedSearch)}
                className="flex-1 text-left min-w-0"
              >
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {savedSearch.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {formatSearchQuery(savedSearch.search_query)}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Used {savedSearch.use_count} times
                </div>
              </button>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button
                  onClick={() => handleExecuteSavedSearch(savedSearch)}
                  className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  title="Execute search"
                >
                  <PlayIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteSavedSearch(savedSearch.id, savedSearch.name)}
                  className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  title="Delete search"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSearchesDashboard;
