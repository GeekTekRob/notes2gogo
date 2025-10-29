import { useEffect, useCallback } from 'react';

/**
 * Custom hook for text formatting keyboard shortcuts in textarea elements
 * Implements Ctrl+B for bold formatting (Markdown syntax)
 * 
 * @param {React.RefObject} textareaRef - Reference to the textarea element
 * @param {Function} onUpdate - Callback when content is updated
 */
const useTextFormatting = (textareaRef, onUpdate) => {
  const insertFormatting = useCallback((before, after = before) => {
    if (!textareaRef?.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    // Insert formatting markers
    const newText = beforeText + before + selectedText + after + afterText;
    
    if (onUpdate) {
      onUpdate(newText);
    }

    // Update textarea value
    textarea.value = newText;

    // Set cursor position
    setTimeout(() => {
      const newCursorPos = selectedText 
        ? start + before.length + selectedText.length + after.length
        : start + before.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [textareaRef, onUpdate]);

  const handleKeyDown = useCallback((event) => {
    const isMod = event.ctrlKey || event.metaKey;

    // Ctrl/Cmd + B: Bold
    if (isMod && event.key === 'b') {
      event.preventDefault();
      insertFormatting('**');
      return;
    }

    // Ctrl/Cmd + I: Italic
    if (isMod && event.key === 'i') {
      event.preventDefault();
      insertFormatting('*');
      return;
    }

    // Ctrl/Cmd + K: Link (Markdown)
    if (isMod && event.key === 'k') {
      // Only if textarea is focused, otherwise let global search handler work
      if (document.activeElement === textareaRef?.current) {
        event.preventDefault();
        insertFormatting('[', '](url)');
      }
      return;
    }
  }, [insertFormatting, textareaRef]);

  useEffect(() => {
    const textarea = textareaRef?.current;
    if (!textarea) return;

    textarea.addEventListener('keydown', handleKeyDown);
    return () => {
      textarea.removeEventListener('keydown', handleKeyDown);
    };
  }, [textareaRef, handleKeyDown]);

  return {
    insertFormatting
  };
};

export default useTextFormatting;
