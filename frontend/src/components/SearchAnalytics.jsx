import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import useSearchStore from '../store/searchStore';
import {
  FireIcon,
  ChartBarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const SearchAnalytics = () => {
  const navigate = useNavigate();
  const { setQuery, search } = useSearchStore();
  
  const [popularSearches, setPopularSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('popular'); // 'popular' or 'trending'

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const [popularRes, trendingRes, statsRes] = await Promise.all([
        analyticsAPI.getPopularSearches(10), // Fetch more to filter
        analyticsAPI.getTrendingSearches(5),
        analyticsAPI.getStats()
      ]);
      
      // Filter popular searches to only show ones with results, limit to top 5
      const popularWithResults = popularRes.data
        .filter(item => item.avg_result_count && item.avg_result_count > 0)
        .slice(0, 5);
      
      setPopularSearches(popularWithResults);
      setTrendingSearches(trendingRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching search analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClick = (queryText) => {
    setQuery(queryText);
    search(1);
    navigate('/search');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats || (popularSearches.length === 0 && trendingSearches.length === 0)) {
    return null; // Don't show if no analytics data
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Header with Stats */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2" />
            Search Insights
          </h3>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.total_searches}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Searches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.unique_queries}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Unique Queries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.searches_today}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.searches_this_week}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">This Week</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('popular')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'popular'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <FireIcon className="w-4 h-4 inline mr-2" />
            Popular
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'trending'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <ArrowTrendingUpIcon className="w-4 h-4 inline mr-2" />
            Trending
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'popular' && (
          <div className="space-y-2">
            {popularSearches.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No popular searches yet</p>
              </div>
            ) : (
              popularSearches.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchClick(item.query_text)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {item.query_text}
                        </span>
                        {index < 3 && (
                          <FireIcon className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{item.search_count} searches</span>
                        {item.avg_result_count && (
                          <span>~{Math.round(item.avg_result_count)} results</span>
                        )}
                        <span className="flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {formatDate(item.last_searched_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="space-y-2">
            {trendingSearches.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <ArrowTrendingUpIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No trending searches yet</p>
              </div>
            ) : (
              trendingSearches.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchClick(item.query_text)}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {item.query_text}
                        </span>
                        {item.trend_direction === 'up' && (
                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{item.recent_search_count} recent</span>
                        <span>({item.search_count} total)</span>
                        <span className="flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {formatDate(item.last_searched_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAnalytics;
