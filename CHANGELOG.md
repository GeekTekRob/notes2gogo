# Changelog

All notable changes to the Notes2GoGo project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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
