import { useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import useAnnouncement from '../hooks/useAnnouncement';

/**
 * Toast notification component with ARIA support
 * Automatically announces messages to screen readers
 */
const Toast = ({ message, type = 'info', onClose, duration = 5000 }) => {
  const announce = useAnnouncement();

  useEffect(() => {
    // Announce to screen readers
    const priority = type === 'error' ? 'assertive' : 'polite';
    announce(message, priority);

    // Auto-dismiss after duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, type, duration, onClose, announce]);

  const icons = {
    success: <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />,
    error: <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />,
    warning: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />,
    info: <InformationCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
  };

  const colors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`flex items-start gap-3 p-4 rounded-lg border ${colors[type]} shadow-lg transition-all duration-300`}
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label="Dismiss notification"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Toast;
