import { useCallback } from 'react';

/**
 * Custom hook for making screen reader announcements
 * Uses ARIA live regions to announce dynamic content changes
 */
const useAnnouncement = () => {
  const announce = useCallback((message, priority = 'polite') => {
    // Find or create the announcement container
    let announcer = document.getElementById('screen-reader-announcer');
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'screen-reader-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
    }

    // Update the aria-live priority if needed
    if (announcer.getAttribute('aria-live') !== priority) {
      announcer.setAttribute('aria-live', priority);
    }

    // Clear and set new message
    announcer.textContent = '';
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }, []);

  return announce;
};

export default useAnnouncement;
