# ♿ Accessibility Guide

**Notes2GoGo is built with accessibility as a core principle, following WCAG 2.1 AA guidelines.**

This comprehensive guide covers keyboard shortcuts, ARIA support, screen reader compatibility, testing procedures, and development guidelines for maintaining accessibility standards.

---

## 📋 Table of Contents

1. [Quick Reference - Keyboard Shortcuts](#-quick-reference---keyboard-shortcuts)
2. [Features Implemented](#-features-implemented)
3. [Testing Checklist](#-testing-checklist)
4. [Usage Examples](#-usage-examples)
5. [Development Guidelines](#-development-guidelines)
6. [Architecture Overview](#-architecture-overview)
7. [Resources](#-resources)

---

## ⌨️ Quick Reference - Keyboard Shortcuts

### Essential Shortcuts

| Action | Windows/Linux | Mac | Description |
|--------|--------------|-----|-------------|
| **New Note** | `Alt` + `N` | `Alt` + `N` | Create a new note |
| **Save Note** | `Ctrl` + `S` | `⌘` + `S` | Save current note (editor only) |
| **Search** | `Ctrl` + `K` | `⌘` + `K` | Focus search bar |
| **Search (Alt)** | `Ctrl` + `F` | `⌘` + `F` | Focus search bar (alternative) |
| **Toggle Sidebar** | `Ctrl` + `\` | `⌘` + `\` | Show/hide sidebar |
| **Escape** | `Esc` | `Esc` | Clear search, close modals |

### Text Formatting (Note Editor)

| Format | Windows/Linux | Mac | Result |
|--------|--------------|-----|--------|
| **Bold** | `Ctrl` + `B` | `⌘` + `B` | `**text**` |
| **Italic** | `Ctrl` + `I` | `⌘` + `I` | `*text*` |
| **Link** | `Ctrl` + `K` | `⌘` + `K` | `[text](url)` |

### Navigation

| Action | Key | Description |
|--------|-----|-------------|
| **Next Element** | `Tab` | Move to next interactive element |
| **Previous Element** | `Shift` + `Tab` | Move to previous element |
| **Activate** | `Enter` or `Space` | Activate button/link |
| **Close/Cancel** | `Esc` | Close dialog or clear input |

💡 **Tip:** Press the keyboard icon (⌨️) in the bottom-right corner for an in-app shortcuts reference.

---

## 🎯 Features Implemented

### 1. Enhanced ARIA Attributes and Screen Reader Support

All interactive elements throughout the application have been enhanced with proper ARIA attributes for full screen reader compatibility.

#### Navigation (`Navbar.jsx`)
- **`role="navigation"`** with `aria-label="Main navigation"`
- All icon-only buttons have descriptive `aria-label` attributes
- Icons marked with `aria-hidden="true"` to prevent redundant announcements
- Theme toggle announces current state to screen readers
- User status clearly announced with proper labeling

#### Main Content Regions
- **`<main role="main">`** clearly identifies the primary content area
- Sidebar marked as **`role="complementary"`** 
- Form regions properly labeled with `aria-label`
- List structures use **`role="list"`** and **`role="listitem"`**

#### Form Controls
- All form inputs have associated `<label>` elements
- Required fields marked with `aria-required="true"`
- Invalid fields indicated with `aria-invalid="true"`
- Error messages linked via `aria-describedby`
- Fieldsets used for related controls with descriptive legends

#### Dynamic Content
- **Toast notification system** with `aria-live` regions
- Live announcements for state changes (save, delete, create)
- Priority levels (`polite` vs `assertive`) based on message importance
- Screen reader announcements for all critical user actions

#### Interactive Elements
- All buttons have descriptive labels
- Delete confirmations include note titles for context
- Preview/edit mode toggles clearly announce current state
- Pagination controls with proper navigation semantics

### 2. ⌨️ Keyboard Shortcuts System

Complete keyboard shortcut implementation with global hook and help panel:

- **Global keyboard shortcut hook** (`useKeyboardShortcuts.js`)
  - Centralized keyboard event handling
  - Context-aware shortcuts (editor-specific vs global)
  - Prevents conflicts with native browser shortcuts
  - Respects input focus states

- **Keyboard shortcuts help panel** (`KeyboardShortcuts.jsx`)
  - Floating button (⌨️) for quick access
  - Modal display of all available shortcuts
  - Platform-specific key displays (⌘ vs Ctrl)
  - Accessible dialog with proper ARIA attributes

- **Text formatting hook** (`useTextFormatting.js`)
  - Bold, italic formatting in textarea
  - Markdown syntax insertion
  - Selection preservation

See the [Quick Reference](#-quick-reference---keyboard-shortcuts) section above for the complete shortcuts table.

### 3. 🔊 Toast Notification System

Accessible notification system for user feedback:

- **Visual toasts** with semantic colors (success, error, warning, info)
- **Screen reader announcements** via `aria-live` regions
- Auto-dismissal with configurable duration
- Manual dismiss option with accessible button
- Priority-based announcement (assertive for errors, polite for info)

**Components:**
- `Toast.jsx` - Individual notification component
- `ToastContainer.jsx` - Global toast provider and container
- `useAnnouncement.js` - Hook for programmatic announcements

### 4. 🎨 Focus Management

Enhanced focus indicators for keyboard navigation:

- **Visible focus rings** on all interactive elements
- High-contrast focus indicators in dark mode
- Logical tab order throughout the application
- Focus trap in modal dialogs
- Skip to main content (via semantic HTML)

**CSS Implementation:**
```css
*:focus-visible {
  @apply outline-none ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900;
}
```

### 5. 📱 Responsive and Adaptive UI

- Sidebar toggle for mobile and keyboard-only users
- Responsive layouts that maintain accessibility
- Touch-friendly target sizes (minimum 44x44px)
- Proper heading hierarchy (h1, h2, h3)

## 🧪 Testing and Validation

### Recommended Testing Tools

1. **Screen Readers**
   - Windows: NVDA (free), JAWS
   - Mac: VoiceOver (built-in)
   - Linux: Orca

2. **Automated Testing**
   - Lighthouse (Chrome DevTools) - Accessibility audit
   - axe DevTools (browser extension)
   - WAVE (Web Accessibility Evaluation Tool)

3. **Keyboard-Only Testing**
   - Navigate entire app using only Tab, Enter, Arrow keys, and Esc
   - Verify all interactive elements are reachable
   - Check focus indicators are clearly visible

### Validation Checklist

- ✅ All functionality available via keyboard
- ✅ Screen readers announce all content clearly
- ✅ Focus indicators visible on all interactive elements
- ✅ Form errors properly associated and announced
- ✅ Dynamic content changes announced to screen readers
- ✅ No keyboard traps (can always navigate away)
- ✅ Logical tab order throughout application
- ✅ Sufficient color contrast (WCAG AA)
- ✅ All images and icons have appropriate text alternatives

## 📚 Usage Examples

### Using Keyboard Shortcuts

```jsx
// Creating a new note
// Press: Ctrl+N (Windows) or ⌘+N (Mac)
// Result: Navigates to /notes/new

// Saving a note
// Press: Ctrl+S (Windows) or ⌘+S (Mac)
// Result: Submits the form and saves the note

// Focusing search
// Press: Ctrl+K (Windows) or ⌘+K (Mac)
// Result: Focuses and selects text in search bar
```

### Announcing to Screen Readers

```jsx
import { useToast } from '../components/ToastContainer';

const MyComponent = () => {
  const { showToast } = useToast();
  
  const handleAction = async () => {
    const result = await performAction();
    
    if (result) {
      // Success announcement (polite)
      showToast('Action completed successfully', 'success');
    } else {
      // Error announcement (assertive)
      showToast('Action failed. Please try again.', 'error');
    }
  };
};
```

### Adding ARIA Labels

```jsx
// Icon-only button
<button
  onClick={handleDelete}
  className="p-2 hover:bg-red-50"
  aria-label={`Delete ${noteName}`}
>
  <TrashIcon className="h-5 w-5" aria-hidden="true" />
</button>

// Form input with error
<input
  type="text"
  id="title"
  aria-required="true"
  aria-invalid={hasError ? 'true' : 'false'}
  aria-describedby={hasError ? 'title-error' : undefined}
/>
{hasError && (
  <p id="title-error" role="alert">
    {errorMessage}
  </p>
)}
```

## 🔧 Development Guidelines

### Adding New Features

When adding new features, ensure:

1. **All interactive elements** have proper ARIA labels
2. **Forms** use semantic HTML with proper labels
3. **Dynamic content** uses live regions when appropriate
4. **Icons** are hidden from screen readers (`aria-hidden="true"`)
5. **Focus management** is maintained in modals and dialogs
6. **Color alone** is not used to convey information
7. **Keyboard shortcuts** are documented and non-conflicting

### Code Review Checklist

- [ ] All buttons/links have accessible names
- [ ] Form controls have associated labels
- [ ] Errors are announced to screen readers
- [ ] Modals have proper `role="dialog"` and `aria-modal`
- [ ] Lists use proper semantic markup
- [ ] Focus is managed appropriately
- [ ] Toast notifications for async operations
- [ ] Keyboard shortcuts don't conflict with browser defaults

---

## ✅ Testing Checklist

### Pre-Testing Setup

- [ ] Application running locally
- [ ] Browser: Chrome, Firefox, or Edge (latest version)
- [ ] Screen reader installed (NVDA, JAWS, VoiceOver, or Orca)
- [ ] Test user account created

### Global Keyboard Shortcuts

- [ ] **Alt+N**: Creates new note from any page
- [ ] **Ctrl/Cmd+K**: Focuses search bar
- [ ] **Ctrl/Cmd+F**: Focuses search bar (alternative)
- [ ] **Ctrl/Cmd+\\**: Toggles sidebar visibility
- [ ] **Esc**: Clears search when search is focused

### Dashboard Tests

- [ ] Tab through all note cards
- [ ] All note titles clickable with Enter
- [ ] Edit/Delete buttons accessible via keyboard
- [ ] Pagination buttons work with keyboard
- [ ] Tag filter buttons work with keyboard

### Note Editor Tests

- [ ] **Ctrl/Cmd+S**: Saves the note
- [ ] **Ctrl/Cmd+B**: Applies bold formatting
- [ ] **Ctrl/Cmd+I**: Applies italic formatting
- [ ] Tab through all form fields
- [ ] Note type toggle accessible via keyboard
- [ ] Preview/Edit toggle works with keyboard

### Screen Reader Tests

- [ ] Navigation announces "Navigation, main navigation"
- [ ] Logo link announced as "Notes2GoGo home"
- [ ] All icons hidden from screen reader (aria-hidden="true")
- [ ] Form validation errors announced immediately
- [ ] Toast notifications announce automatically
- [ ] Note list announced with item count

### Focus Indicator Tests

- [ ] Focus ring visible on all buttons, links, inputs
- [ ] Focus ring has good contrast (3:1 minimum)
- [ ] Focus ring visible in dark mode
- [ ] Logical tab order throughout app
- [ ] No focus traps

### Toast Notification Tests

- [ ] Toast appears on note creation/update/deletion
- [ ] Multiple toasts stack properly
- [ ] Toasts auto-dismiss after 5 seconds
- [ ] Manual dismiss button works
- [ ] Success/info use aria-live="polite"
- [ ] Errors use aria-live="assertive"

### Automated Testing

- [ ] Run Lighthouse accessibility audit (target: 90+)
- [ ] Run axe DevTools scan (no critical violations)
- [ ] Run WAVE evaluation (no errors)
- [ ] Verify contrast ratios meet WCAG AA

---

## 🏗️ Architecture Overview

### Component Structure

```
App.jsx (ToastProvider wrapper)
├── Navbar (ARIA labels, navigation role)
├── Page Components
│   ├── Dashboard (keyboard shortcuts, toast notifications)
│   ├── NoteEditor (form accessibility, keyboard shortcuts)
│   └── NoteView (ARIA labels, semantic HTML)
└── KeyboardShortcuts (floating help button)
```

### Key Hooks

- **`useKeyboardShortcuts`** - Global keyboard shortcut management
- **`useAnnouncement`** - Screen reader announcement utility  
- **`useTextFormatting`** - Text formatting shortcuts for textarea
- **`useToast`** - Toast notification system (from ToastContainer context)

### Data Flow

```
User Action → Keyboard Event → useKeyboardShortcuts → Navigate/Execute
User Action → API Call → showToast() → Visual Toast + ARIA Announcement
Component Renders → ARIA Attributes → Screen Reader Output
```

---

## 📖 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [Inclusive Components](https://inclusive-components.design/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)

---

## 🎯 Future Enhancements

Potential improvements for future phases:

- [ ] Skip navigation links
- [ ] High contrast mode toggle
- [ ] Font size adjustment controls
- [ ] Additional keyboard shortcuts (arrow key note navigation)
- [ ] Voice navigation support
- [ ] Keyboard shortcut customization
- [ ] Screen reader mode optimizations

---

## 🐛 Reporting Accessibility Issues

If you discover accessibility issues:

1. **Document the issue:**
   - Screen reader/browser combination
   - Steps to reproduce
   - Expected vs actual behavior

2. **Test with multiple tools:**
   - Different screen readers
   - Automated accessibility audits
   - Keyboard-only navigation

3. **Create detailed bug report:**
   - WCAG criterion reference if applicable
   - Suggested solutions
   - Severity level

---

**Last Updated:** October 29, 2025  
**WCAG Conformance Target:** AA  
**Maintained By:** Notes2GoGo Development Team
