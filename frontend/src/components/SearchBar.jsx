import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useSearchStore from '../store/searchStore';
import { useNotesStore } from '../store/notesStore';
import { analyticsAPI } from '../services/api';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const SearchBar = ({ inNavbar = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);
  
  // Search store for /search page
  const { 
    query, 
    setQuery, 
    search, 
    clearSearch, 
    toggleAdvancedFilters,
    isAdvancedFiltersOpen 
  } = useSearchStore();
  
  // Notes store for dashboard
  const { 
    filters: notesFilters,
    setFilters: setNotesFilters,
    fetchNotes
  } = useNotesStore();
  
  const [localQuery, setLocalQuery] = useState(query);
  const [showHelp, setShowHelp] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const isSearchPage = location.pathname === '/search';
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Escape to clear and blur
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        e.preventDefault();
        handleClear();
        inputRef.current?.blur();
        setShowSuggestions(false);
      }
      
      // Arrow key navigation for suggestions
      if (showSuggestions && suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : -1);
        } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedSuggestionIndex].query_text);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, suggestions, selectedSuggestionIndex]);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);
  
  // Sync with dashboard search filter
  useEffect(() => {
    if (isDashboard && notesFilters.search) {
      setLocalQuery(notesFilters.search);
    }
  }, [isDashboard, notesFilters.search]);

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (localQuery.length >= 2) {
        setIsLoadingSuggestions(true);
        try {
          const response = await analyticsAPI.getSuggestions(localQuery, 5);
          setSuggestions(response.data);
          setShowSuggestions(true);
          setSelectedSuggestionIndex(-1);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (document.activeElement === inputRef.current) {
        fetchSuggestions();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [localQuery]);

  // Debounced live search - works on both search page and dashboard
  useEffect(() => {
    // Only perform live search on search page or dashboard
    if (!isSearchPage && !isDashboard) return;
    
    const debounceTimer = setTimeout(() => {
      if (isSearchPage) {
        // Search page - use searchStore
        if (localQuery !== query) {
          if (localQuery.trim()) {
            setQuery(localQuery);
            search(1);
          } else if (localQuery === '' && query !== '') {
            setQuery('');
            clearSearch();
          }
        }
      } else if (isDashboard) {
        // Dashboard - use notesStore
        if (localQuery !== notesFilters.search) {
          setNotesFilters({ search: localQuery });
          fetchNotes(1);
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimer);
  }, [localQuery, isSearchPage, isDashboard, query, notesFilters.search]);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!localQuery.trim()) return;
    
    setQuery(localQuery);
    await search(1); // Reset to page 1
    
    // Navigate to search results page
    navigate('/search');
  };

  const handleClear = () => {
    setLocalQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (isSearchPage) {
      setQuery('');
      clearSearch();
    } else if (isDashboard) {
      setNotesFilters({ search: '' });
      fetchNotes(1);
    }
  };

  const handleInputChange = (e) => {
    setLocalQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (localQuery.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSuggestionClick = (suggestionQuery) => {
    setLocalQuery(suggestionQuery);
    setQuery(suggestionQuery);
    setShowSuggestions(false);
    search(1);
    if (!isSearchPage) {
      navigate('/search');
    }
  };

  const handleToggleHelp = () => {
    setShowHelp(!showHelp);
    if (!showHelp) setShowSavedSearches(false); // Close saved searches if opening help
  };

  const handleToggleSavedSearches = () => {
    setShowSavedSearches(!showSavedSearches);
    if (!showSavedSearches) setShowHelp(false); // Close help if opening saved searches
  };

  // Syntax highlighting helper
  const renderSyntaxHelp = () => {
    const syntaxExamples = [
      { operator: 'intitle:', example: 'intitle:meeting', description: 'Search in titles only' },
      { operator: 'tag:', example: 'tag:work', description: 'Filter by tag' },
      { operator: '-tag:', example: '-tag:personal', description: 'Exclude tag' },
      { operator: 'created:', example: 'created:>=2024-10-01', description: 'Filter by creation date' },
      { operator: 'updated:', example: 'updated:<2024-12-31', description: 'Filter by update date' },
      { operator: '"..."', example: '"exact phrase"', description: 'Search exact phrase' },
      { operator: 'NEAR', example: 'python NEAR/5 tutorial', description: 'Find words near each other' },
    ];

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 sm:p-4 z-50 max-h-[70vh] sm:max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">Search Operators</h3>
          <button
            onClick={handleToggleHelp}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
            aria-label="Close help"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3 sm:space-y-2">
          {syntaxExamples.map((item, index) => (
            <div key={index} className="flex flex-col space-y-1">
              <code className="text-xs sm:text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1.5 sm:py-1 rounded inline-block">
                {item.example}
              </code>
              <span className="text-xs sm:text-xs text-gray-600 dark:text-gray-400">{item.description}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 hidden sm:block">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
              Ctrl+K
            </kbd>{' '}
            to focus search
          </p>
        </div>
      </div>
    );
  };

  // Render search suggestions dropdown
  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-[50vh] sm:max-h-96 overflow-y-auto">
        <div className="py-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion.query_text)}
              className={`w-full px-3 sm:px-4 py-3 sm:py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation ${
                index === selectedSuggestionIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <ClockIcon className="w-4 h-4 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm sm:text-sm text-gray-900 dark:text-gray-100 truncate">
                    {suggestion.query_text}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  <span className="hidden sm:inline">{suggestion.search_count} searches</span>
                  <span className="sm:hidden">{suggestion.search_count}</span>
                  {suggestion.relevance_score > 0.7 && (
                    <FireIcon className="w-4 h-4 text-orange-500" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${inNavbar ? 'w-full' : 'w-full'}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          <MagnifyingGlassIcon className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
          
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Search notes..."
            className="w-full pl-10 pr-32 sm:pr-36 py-2.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-base sm:text-sm
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                     transition-colors"
            aria-label="Search notes"
          />
          
          <div className="absolute right-1 flex items-center space-x-0.5 sm:space-x-1">
            {localQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 sm:p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
                title="Clear search"
                aria-label="Clear search"
              >
                <XMarkIcon className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            )}
            
            <button
              type="button"
              onClick={toggleAdvancedFilters}
              className={`p-2 sm:p-1.5 rounded transition-colors touch-manipulation ${
                isAdvancedFiltersOpen
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Advanced filters"
              aria-label="Toggle advanced filters"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              onClick={handleToggleSavedSearches}
              className={`p-2 sm:p-1.5 rounded transition-colors touch-manipulation ${
                showSavedSearches
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Saved searches"
              aria-label="Toggle saved searches"
            >
              <BookmarkIcon className="w-5 h-5" />
            </button>
            
            <button
              type="button"
              onClick={handleToggleHelp}
              className="p-2 sm:px-2 sm:py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors touch-manipulation"
              title="Search syntax help"
              aria-label="Show search syntax help"
            >
              <span className="hidden sm:inline">?</span>
              <span className="sm:hidden text-lg">?</span>
            </button>
          </div>
        </div>
      </form>
      
      {renderSuggestions()}
      {showHelp && renderSyntaxHelp()}
      
      {showSavedSearches && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-1 max-h-96 overflow-y-auto">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 py-2">
              See saved searches on the search results page
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
