import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom hook for managing global keyboard shortcuts
 * Implements Phase 1 keyboard shortcuts for accessibility and power users
 */
const useKeyboardShortcuts = ({ 
  searchInputRef = null,
  onToggleSidebar = null,
  onSave = null,
  onCreateNote = null,
  disabled = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleKeyboardShortcut = useCallback((event) => {
    if (disabled) return;

    // Check for modifier keys (Ctrl on Windows/Linux, Cmd on Mac)
    const isMod = event.ctrlKey || event.metaKey;
    
    // Don't trigger shortcuts when user is typing in input fields (except search)
    const isInInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
    const isSearchInput = searchInputRef?.current === event.target;

    // Alt + N: Create new note (Alt avoids browser conflict with Ctrl+N for new tab)
    if (event.altKey && event.key === 'n' && !isInInput) {
      event.preventDefault();
      if (onCreateNote) {
        onCreateNote();
      } else {
        navigate('/notes/new');
      }
      return;
    }

    // Ctrl/Cmd + S: Save note (only in editor)
    if (isMod && event.key === 's') {
      event.preventDefault();
      if (onSave) {
        onSave();
      }
      return;
    }

    // Ctrl/Cmd + K or Ctrl/Cmd + F: Focus search bar
    if (isMod && (event.key === 'k' || event.key === 'f')) {
      event.preventDefault();
      if (searchInputRef?.current) {
        searchInputRef.current.focus();
        searchInputRef.current.select();
      }
      return;
    }

    // Ctrl/Cmd + \: Toggle sidebar/note list
    if (isMod && event.key === '\\') {
      event.preventDefault();
      if (onToggleSidebar) {
        onToggleSidebar();
      }
      return;
    }

    // Escape: Clear search or blur active element
    if (event.key === 'Escape') {
      if (isSearchInput && searchInputRef?.current) {
        searchInputRef.current.value = '';
        searchInputRef.current.blur();
      } else if (document.activeElement) {
        document.activeElement.blur();
      }
      return;
    }
  }, [navigate, searchInputRef, onToggleSidebar, onSave, onCreateNote, disabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, [handleKeyboardShortcut]);

  return null;
};

export default useKeyboardShortcuts;
