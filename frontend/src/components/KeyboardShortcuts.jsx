import { useState } from 'react';
import { XMarkIcon, CommandLineIcon } from '@heroicons/react/24/outline';

/**
 * Keyboard shortcuts help panel
 * Displays available shortcuts to users for accessibility and power-user efficiency
 */
const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { key: 'Alt + N', action: 'Create new note' },
    { key: `${modKey} + S`, action: 'Save/sync current note' },
    { key: `${modKey} + K`, action: 'Focus search bar', alternative: `${modKey} + F` },
    { key: `${modKey} + \\`, action: 'Toggle sidebar/note list' },
    { key: '↑ / ↓', action: 'Navigate note list (when focused)' },
    { key: 'Esc', action: 'Clear search or close modals' },
  ];

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-primary-600 dark:bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors z-40"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts"
      >
        <CommandLineIcon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 
                id="shortcuts-title"
                className="text-xl font-bold text-gray-900 dark:text-gray-100"
              >
                ⌨️ Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close shortcuts panel"
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {shortcut.action}
                  </span>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                      {shortcut.key}
                    </kbd>
                    {shortcut.alternative && (
                      <>
                        <span className="text-xs text-gray-500 dark:text-gray-400">or</span>
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                          {shortcut.alternative}
                        </kbd>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>💡 Tip:</strong> These shortcuts work throughout the application for quick navigation and actions.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;
