import { useState } from 'react';
import useSearchStore from '../store/searchStore';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AdvancedFilters = () => {
  const { filters, setFilter, resetFilters, search } = useSearchStore();
  
  const [localTags, setLocalTags] = useState(filters.tags.join(', '));
  const [localExcludeTags, setLocalExcludeTags] = useState(filters.excludeTags.join(', '));

  const handleTagsChange = (e) => {
    setLocalTags(e.target.value);
    const tagArray = e.target.value.split(',').map(t => t.trim()).filter(t => t);
    setFilter('tags', tagArray);
  };

  const handleExcludeTagsChange = (e) => {
    setLocalExcludeTags(e.target.value);
    const tagArray = e.target.value.split(',').map(t => t.trim()).filter(t => t);
    setFilter('excludeTags', tagArray);
  };

  const handleReset = () => {
    resetFilters();
    setLocalTags('');
    setLocalExcludeTags('');
  };

  const handleApply = async () => {
    await search(1); // Reset to page 1 when filters change
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.tags.length > 0) count++;
    if (filters.excludeTags.length > 0) count++;
    if (filters.noteType) count++;
    if (filters.createdAfter || filters.createdBefore) count++;
    if (filters.updatedAfter || filters.updatedBefore) count++;
    if (filters.titleOnly) count++;
    return count;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Advanced Filters
          {activeFiltersCount() > 0 && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full">
              {activeFiltersCount()} active
            </span>
          )}
        </h3>
        
        {activeFiltersCount() > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline"
          >
            Reset all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Include Tags
          </label>
          <input
            type="text"
            value={localTags}
            onChange={handleTagsChange}
            placeholder="work, important, project"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Comma-separated list of tags
          </p>
        </div>

        {/* Tag Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tag Match Mode
          </label>
          <select
            value={filters.tagMode}
            onChange={(e) => setFilter('tagMode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="and">Match ALL tags (AND)</option>
            <option value="or">Match ANY tag (OR)</option>
          </select>
        </div>

        {/* Exclude Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Exclude Tags
          </label>
          <input
            type="text"
            value={localExcludeTags}
            onChange={handleExcludeTagsChange}
            placeholder="archived, draft"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Exclude notes with these tags
          </p>
        </div>

        {/* Note Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Note Type
          </label>
          <select
            value={filters.noteType || ''}
            onChange={(e) => setFilter('noteType', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="text">Text</option>
            <option value="structured">Structured</option>
          </select>
        </div>

        {/* Created After */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Created After
          </label>
          <input
            type="date"
            value={filters.createdAfter || ''}
            onChange={(e) => setFilter('createdAfter', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Created Before */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Created Before
          </label>
          <input
            type="date"
            value={filters.createdBefore || ''}
            onChange={(e) => setFilter('createdBefore', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Updated After */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Updated After
          </label>
          <input
            type="date"
            value={filters.updatedAfter || ''}
            onChange={(e) => setFilter('updatedAfter', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Updated Before */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Updated Before
          </label>
          <input
            type="date"
            value={filters.updatedBefore || ''}
            onChange={(e) => setFilter('updatedBefore', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.titleOnly}
            onChange={(e) => setFilter('titleOnly', e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Search in titles only
          </span>
        </label>
      </div>

      {/* Apply Button */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={handleApply}
          className="btn btn-primary"
        >
          Apply Filters
        </button>
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount() > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {filters.tags.length > 0 && (
              <div className="flex items-center space-x-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm">
                <span>Tags: {filters.tags.join(', ')}</span>
                <button
                  onClick={() => {
                    setFilter('tags', []);
                    setLocalTags('');
                  }}
                  className="ml-1 hover:text-primary-900 dark:hover:text-primary-100"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {filters.noteType && (
              <div className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                <span>Type: {filters.noteType}</span>
                <button
                  onClick={() => setFilter('noteType', null)}
                  className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {filters.titleOnly && (
              <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                <span>Title only</span>
                <button
                  onClick={() => setFilter('titleOnly', false)}
                  className="ml-1 hover:text-green-900 dark:hover:text-green-100"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
