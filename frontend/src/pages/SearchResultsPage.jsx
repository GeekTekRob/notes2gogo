import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSearchStore from '../store/searchStore';
import SearchBar from '../components/SearchBar';
import AdvancedFilters from '../components/AdvancedFilters';
import SavedSearches from '../components/SavedSearches';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookmarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const SearchResultsPage = () => {
  const navigate = useNavigate();
  
  const {
    query,
    results,
    total,
    page,
    perPage,
    hasNext,
    hasPrev,
    isLoading,
    error,
    executionTimeMs,
    isAdvancedFiltersOpen,
    setPage,
    search,
  } = useSearchStore();

  useEffect(() => {
    // If there's a query, perform search on mount
    if (query) {
      search();
    }
  }, []);

  const handlePageChange = async (newPage) => {
    setPage(newPage);
    await search(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResultClick = (noteId) => {
    // Pass search query as URL param for highlighting
    const params = new URLSearchParams();
    if (query) {
      params.set('q', query);
    }
    navigate(`/notes/${noteId}?${params.toString()}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const highlightText = (text, snippet = false) => {
    // Simple highlighting - in production, use a more sophisticated approach
    if (!text) return '';
    
    // Limit snippet length
    if (snippet && text.length > 300) {
      text = text.substring(0, 300) + '...';
    }
    
    return text;
  };

  if (!query && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <SearchBar inNavbar={false} />
          </div>
          
          <div className="text-center py-16">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Search your notes
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Use advanced search operators to find exactly what you're looking for.
              Try <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">intitle:</code>, 
              <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm ml-1">tag:</code>, or 
              <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm ml-1">"exact phrase"</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar inNavbar={false} />
        </div>

        {/* Saved Searches */}
        <div className="mb-6">
          <SavedSearches />
        </div>

        {/* Advanced Filters */}
        {isAdvancedFiltersOpen && (
          <div className="mb-6">
            <AdvancedFilters />
          </div>
        )}

        {/* Search Results Header */}
        {!isLoading && !error && results.length > 0 && (
          <div className="mb-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>
              Found <span className="font-semibold text-gray-900 dark:text-gray-100">{total}</span> result{total !== 1 ? 's' : ''} 
              {executionTimeMs > 0 && (
                <span className="ml-2">
                  (<span className="font-medium">{executionTimeMs.toFixed(0)}ms</span>)
                </span>
              )}
            </div>
            
            {/* Pagination Info */}
            <div>
              Showing {((page - 1) * perPage) + 1} - {Math.min(page * perPage, total)} of {total}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !error && results.length === 0 && query && (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try different keywords or adjust your filters
            </p>
          </div>
        )}

        {/* Search Results */}
        {!isLoading && !error && results.length > 0 && (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => handleResultClick(result.id)}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                {/* Title and Relevance */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex-1">
                    {result.title}
                  </h3>
                  
                  {result.relevance_score > 0 && (
                    <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      {result.relevance_score.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Snippet */}
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                  {highlightText(result.snippet, true)}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-4">
                    {/* Match Locations */}
                    {result.match_locations && result.match_locations.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Found in:</span>
                        {result.match_locations.map((location, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs capitalize">
                            {location}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Updated Date */}
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatDate(result.updated_at)}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {result.tags && result.tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <TagIcon className="w-4 h-4" />
                      <div className="flex flex-wrap gap-1">
                        {result.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {result.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                            +{result.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && results.length > 0 && (total > perPage) && (
          <div className="mt-8 flex items-center justify-center space-x-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={!hasPrev}
              className="flex items-center space-x-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                       hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Page {page} of {Math.ceil(total / perPage)}
            </span>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasNext}
              className="flex items-center space-x-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300
                       hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
            >
              <span>Next</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
