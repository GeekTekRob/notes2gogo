# Changelog

All notable changes to the Notes2GoGo project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Accessibility & Keyboard Navigation (Phase 1)**: Comprehensive WCAG 2.1 AA compliance features
  - **Keyboard Shortcuts System**:
    - `Alt+N`: Create new note (avoids browser conflict)
    - `Ctrl/Cmd+S`: Save/sync current note (in editor)
    - `Ctrl/Cmd+K` or `Ctrl/Cmd+F`: Focus search bar
    - `Ctrl/Cmd+\`: Toggle sidebar/note list
    - `Esc`: Clear search or close modals
    - `Ctrl/Cmd+B`: Bold text formatting (in editor)
    - `Ctrl/Cmd+I`: Italic text formatting (in editor)
  - **ARIA Support**:
    - All interactive controls have descriptive `aria-label` attributes
    - Form validation errors properly announced with `aria-invalid` and `aria-describedby`
    - Dynamic content updates use `aria-live` regions
    - Navigation structure uses semantic roles (`role="navigation"`, `role="main"`, `role="complementary"`)
    - Icon-only buttons hidden from screen readers with `aria-hidden="true"`
    - Proper form semantics with `aria-required` and error associations
  - **Toast Notification System**:
    - Visual feedback with success, error, warning, and info variants
    - Screen reader announcements via ARIA live regions
    - Auto-dismiss with manual override option
    - Priority-based announcements (assertive for errors, polite for info)
  - **Focus Management**:
    - Visible focus indicators on all interactive elements
    - Enhanced `:focus-visible` styles for keyboard navigation
    - High-contrast focus rings in dark mode
    - Logical tab order throughout application
  - **Keyboard Shortcuts Help**:
    - Floating help button with keyboard icon
    - Modal displaying all available shortcuts
    - Platform-specific key display (⌘ for Mac, Ctrl for Windows/Linux)
    - Fully accessible dialog with ARIA attributes
  - **New Hooks**:
    - `useKeyboardShortcuts`: Global keyboard shortcut management
    - `useAnnouncement`: Screen reader announcement utility
    - `useTextFormatting`: Text formatting shortcuts for textarea
  - **New Components**:
    - `Toast.jsx`: Individual toast notification
    - `ToastContainer.jsx`: Global toast provider
    - `KeyboardShortcuts.jsx`: Keyboard shortcuts help panel
  - **Documentation**:
    - Comprehensive `ACCESSIBILITY.md` guide (consolidated from 5+ separate docs)
    - Testing checklist for QA validation
    - Architecture overview and component structure
    - WCAG 2.1 AA compliance guidelines
- **Documentation Consolidation**: Simplified repository structure by merging multiple documentation files:
  - Consolidated `KEYBOARD_SHORTCUTS_REFERENCE.md`, `TESTING_CHECKLIST.md`, `ARCHITECTURE_ACCESSIBILITY.md`, `VISUAL_SUMMARY.md`, and `PHASE1_IMPLEMENTATION_SUMMARY.md` into single comprehensive `ACCESSIBILITY.md`
  - Created `docs/` folder with organized topic-specific guides:
    - `docs/ACCESSIBILITY.md` - Complete accessibility guide
    - `docs/TAGS.md` - Tag system guide with examples
    - `docs/SEARCH_ANALYTICS.md` - Search analytics and insights guide
    - `docs/API.md` - Complete REST API reference
    - `docs/CONTRIBUTING.md` - Contribution guidelines
    - `docs/README.md` - Documentation index
  - Simplified main `README.md` by moving detailed content to focused docs
  - Maintained 2 core root files: `README.md` (overview), `CHANGELOG.md` (history)
  - Improved discoverability while reducing documentation maintenance overhead

### Changed
- Keyboard shortcut for creating new notes changed from `Ctrl+N` to `Alt+N` to avoid browser conflict (opens new tab/window in Chrome, Firefox, Edge)
    - `ACCESSIBILITY.md`: Comprehensive accessibility documentation
    - `KEYBOARD_SHORTCUTS_REFERENCE.md`: Quick reference card
    - `ARCHITECTURE_ACCESSIBILITY.md`: Component architecture diagram
    - `PHASE1_IMPLEMENTATION_SUMMARY.md`: Implementation summary
- **Search Analytics System**: Comprehensive search tracking and insights
  - Automatic tracking of all search queries with frequency and result counts
  - Smart search suggestions/autocomplete based on search history (min 2 characters)
  - Popular searches dashboard showing most frequent queries
  - Trending searches identifying queries gaining popularity (last 7 days comparison)
  - Search statistics: total searches, unique queries, average results, most searched
  - Keyboard navigation support in suggestion dropdown (↑↓ arrows, Enter, Escape)
  - Visual indicators for popular (🔥) and trending searches
  - Per-user analytics with privacy-first approach (no cross-user tracking)
  - Database migration for `search_analytics` table with proper indexing
  - Backend API endpoints: `/api/analytics/popular`, `/api/analytics/suggestions`, `/api/analytics/trending`, `/api/analytics/stats`
  - Frontend `SearchAnalytics` component with tabbed interface
  - Enhanced `SearchBar` component with autocomplete dropdown
- Live search functionality with real-time filtering as users type
- Search debouncing (300ms delay) to reduce server load
- Clear search button (✕) that appears when search input has text
- Comprehensive search across titles, tags, and all content (both text and structured notes)
- Enhanced structured note editor with card-based layout
- Better visual hierarchy for structured note sections
- `.gitignore` file covering Python, Node.js, Docker, and common development files

### Changed
- **Enhanced Semantic HTML**: Updated page components to use proper semantic elements
  - `<main role="main">` for primary content
  - `<aside role="complementary">` for sidebar
  - `<nav role="navigation">` with descriptive labels
  - `<article>` for note cards
- **Improved Form Accessibility**: All forms now have proper ARIA attributes and validation feedback
- **Better Button Labels**: All icon-only buttons now have descriptive text for screen readers
- **Enhanced Notifications**: Success/error messages now announce to screen readers automatically
- Search now automatically filters without requiring a button click
- Search placeholder text updated to "Search notes (title, tags, content)..." for clarity
- Button layouts improved with `inline-flex` and `whitespace-nowrap` for better appearance
- "New Note" and "Create Your First Note" buttons now display on single lines
- Structured note section layout reorganized with delete button at top-right
- Delete button in structured notes enlarged for better visibility (h-5 w-5)
- Frontend port updated to port 80 (http://localhost) instead of 3000
- Database connection updated to use Docker service name 'db' instead of 'localhost'
- Documentation updated to use 'docker compose' across README and CONTRIBUTING
- Frontend URL corrected to http://localhost:3000 in README
- Removed deprecated helper files: start.ps1, setup-tag-system.ps1, TAG_SYSTEM_DEPLOYMENT.md (repository cleanup)
- Tightened .gitignore to exclude caches, coverage, and build artifacts

### Fixed
- Keyboard navigation throughout the application
- Screen reader accessibility issues with unlabeled controls
- Missing focus indicators on interactive elements
- Form validation not being announced to screen readers
- Icon-only buttons lacking accessible names
- Button text wrapping issues causing broken layouts
- Small, unclear delete icon in structured note sections
- Search limited to only titles - now searches all content
- Structured note section layout was cramped and unclear

### Technical
- Search analytics backend integration in `SearchService._track_search_analytics()`
- Database schema includes `search_analytics` table with user_id, query_text, search_count, and timestamps
- Relevance scoring for search suggestions based on frequency and recency
- Rolling average calculation for result counts in analytics
- Backend search now uses SQLAlchemy `or_()` with multiple conditions
- Search includes casting JSONB and array types to String for comprehensive text search
- React useEffect with debouncing for efficient search updates
- Improved CSS classes for consistent button styling across components

## [0.1.0] - Initial Release

### Added
- FastAPI backend with JWT authentication
- React frontend with Tailwind CSS
- PostgreSQL database with JSONB support
- Docker Compose setup for easy deployment
- User registration and login
- Text notes with Markdown support
- Structured notes with key-value pairs
- Tag system for note organization
- Pagination for note listings
- Basic search functionality
- API documentation with Swagger/OpenAPI
- Database migrations with Alembic
- Zustand for state management
- React Hook Form with validation
