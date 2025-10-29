# 🗺️ Product Roadmap

Detailed feature planning and development timeline for Notes2GoGo.

---

## Vision

Build Notes2GoGo into a **truly universal, accessible-first note-taking application** that combines the simplicity of plain text notes with the power of structured data and advanced search capabilities.

---

## Development Principles

- ✅ **Accessibility First**: WCAG 2.1 AA compliance in everything we build
- ✅ **Privacy Focused**: User data is private, no cross-user tracking
- ✅ **Open Source**: Transparent development, community-driven
- ✅ **Progressive Enhancement**: Core features work everywhere, enhancements where supported
- ✅ **Performance**: Fast and responsive, even with thousands of notes

---

## Current Version: 1.0.0 (October 2025)

### ✅ Completed Features

- User authentication and authorization
- Text notes with Markdown support
- Structured notes with key-value pairs
- Full-text search across all content
- Tags system with many-to-many relationships
- Search analytics and suggestions
- Saved searches
- Keyboard shortcuts (Phase 1)
- ARIA support and screen reader compatibility
- Toast notifications with accessibility
- Dark mode support
- Docker deployment
- Comprehensive documentation

---

## Phase 1: Quick Wins (Core Enhancements) ✅ COMPLETE

**Status**: 100% Complete  
**Timeline**: Completed October 2025  
**Focus**: Accessibility, usability improvements, foundational features

### Completed Items

#### ✅ Tags System
- **Status**: Complete
- **Features**:
  - Create, rename, delete tags
  - Smart autocomplete
  - Filter by tags (AND/OR logic)
  - Bulk tag operations
  - Tag browser with counts
- **Documentation**: [TAGS.md](./TAGS.md)

#### ✅ Search Analytics
- **Status**: Complete
- **Features**:
  - Search tracking with frequency
  - Smart autocomplete suggestions
  - Popular and trending searches
  - Analytics dashboard
  - Privacy-first (per-user only)
- **Documentation**: [SEARCH_ANALYTICS.md](./SEARCH_ANALYTICS.md)

#### ✅ Keyboard Shortcuts
- **Status**: Complete
- **Features**:
  - Alt+N: New note
  - Ctrl/Cmd+S: Save note
  - Ctrl/Cmd+K: Focus search
  - Ctrl/Cmd+\: Toggle sidebar
  - Ctrl/Cmd+B/I: Text formatting
  - Esc: Clear/close
  - Help panel with all shortcuts
- **Documentation**: [ACCESSIBILITY.md](./ACCESSIBILITY.md)

#### ✅ Accessibility (WCAG 2.1 AA)
- **Status**: Complete
- **Features**:
  - Comprehensive ARIA labels
  - Screen reader support
  - Toast notifications with announcements
  - Enhanced focus indicators
  - Semantic HTML throughout
  - Keyboard navigation
  - Testing checklist
- **Documentation**: [ACCESSIBILITY.md](./ACCESSIBILITY.md)

### Upcoming (Phase 1 Extension)

#### 🔄 Export Functionality
- **Status**: Planned
- **Timeline**: November 2025
- **Features**:
  - Export single note as Markdown
  - Export single note as PDF
  - Bulk export selected notes
  - Export all notes as ZIP archive
  - Preserve formatting and metadata
- **Technical**:
  - Backend: `python-markdown` for rendering, `reportlab` for PDF
  - Frontend: Download trigger with progress indicator
  - API: `GET /api/notes/{id}/export?format=md|pdf`

---

## Phase 2: Core Features (Essential Functionality)

**Status**: Planning (20% designed)  
**Timeline**: December 2025 - February 2026  
**Focus**: Organization, productivity, user experience

### 📁 Folder Organization
- **Priority**: High
- **Timeline**: December 2025
- **Description**: Hierarchical folder/notebook system
- **Features**:
  - Create nested folders (unlimited depth)
  - Drag and drop notes between folders
  - Folder tree view in sidebar
  - Breadcrumb navigation
  - Move/copy operations
  - Folder-based filtering
  - Archive folders
- **Technical**:
  - Database: Self-referencing `folders` table with `parent_id`
  - API: Tree structure serialization, move operations
  - Frontend: Tree component with drag-drop
- **Migration**: Existing notes go to "Uncategorized" root folder

### 📅 Natural Language Date Parsing
- **Priority**: Medium
- **Timeline**: January 2026
- **Description**: Human-friendly date queries
- **Features**:
  - Search: "notes from last week"
  - Search: "created yesterday"
  - Search: "updated today"
  - Search: "between Jan 1 and Jan 31"
  - Autocomplete with date suggestions
- **Technical**:
  - Library: `dateparser` (Python) or `chrono-node` (JS)
  - Backend: Parse date expressions to SQL filters
  - Frontend: Date input with NLP preview
- **Examples**:
  ```
  "last week" → 2025-10-22 to 2025-10-29
  "yesterday" → 2025-10-28
  "Q4 2025" → 2025-10-01 to 2025-12-31
  ```

### 💾 Saved Searches UI Enhancement
- **Priority**: Medium
- **Timeline**: January 2026
- **Description**: Full frontend for saved searches (backend exists)
- **Features**:
  - Visual saved search builder
  - One-click execute from sidebar
  - Edit and duplicate searches
  - Share search links (URL params)
  - Search templates (common patterns)
- **Technical**:
  - Frontend: SearchBuilder component with form
  - URL state: Encode search params in URL
  - Templates: Predefined common searches

### 🔍 In-Note Search Highlighting
- **Priority**: Low
- **Timeline**: February 2026
- **Description**: Highlight search terms within note content
- **Features**:
  - Highlight matching text in search results
  - Jump to next/previous match
  - Case-insensitive highlighting
  - Support for regex patterns
  - Highlight in both text and structured notes
- **Technical**:
  - Frontend: Text highlighting library (`mark.js`)
  - Search context: Return matched snippets with positions
  - Navigation: Scroll to highlighted matches

### ⌨️ Full Keyboard Navigation
- **Priority**: Medium
- **Timeline**: Throughout Phase 2
- **Description**: Complete keyboard accessibility
- **Features**:
  - Navigate notes list with arrow keys
  - J/K for next/previous note (Vim-style)
  - Enter to open, Backspace to go back
  - Slash (/) to focus search
  - Tab navigation works everywhere
  - Customizable shortcuts (Phase 5)
- **Technical**:
  - React: Focus management with useRef
  - Keyboard event handling in list components
  - Focus trapping in modals

### 🎨 Theme Customization
- **Priority**: Low
- **Timeline**: February 2026
- **Description**: Extended theme options beyond dark/light
- **Features**:
  - High contrast themes (accessibility)
  - Color-blind friendly themes
  - Custom accent colors
  - Theme preview before applying
  - Export/import themes
- **Technical**:
  - CSS variables for all colors
  - Theme JSON schema
  - LocalStorage for theme persistence
  - WCAG contrast ratio validation

### 🖨️ Print Functionality
- **Priority**: Low
- **Timeline**: February 2026
- **Description**: Print-optimized views
- **Features**:
  - Print single note
  - Print multiple selected notes
  - Print-friendly CSS (no sidebar/nav)
  - Page breaks between notes
  - Customizable headers/footers
- **Technical**:
  - CSS: `@media print` styles
  - Print dialog with options
  - Generate print preview

---

## Phase 3: Advanced Features (Power User Tools)

**Status**: Concept Stage  
**Timeline**: March 2026 - June 2026  
**Focus**: Collaboration, advanced editing, version control

### 🤝 Real-time Collaboration
- **Priority**: High
- **Timeline**: March-April 2026
- **Description**: Share and collaborate on notes
- **Features**:
  - Share notes with view/edit permissions
  - Real-time collaborative editing (CRDT)
  - See who's viewing/editing (presence)
  - Change notifications
  - Comments and annotations
  - Share links (public/private)
  - Revoke access anytime
- **Technical**:
  - WebSockets for real-time sync
  - CRDT library: Yjs or Automerge
  - Database: `note_shares` table with permissions
  - Frontend: Real-time editor component
- **Challenges**: Conflict resolution, performance with many collaborators

### ✏️ Drawing/Sketch Support
- **Priority**: Medium
- **Timeline**: May 2026
- **Description**: Integrated drawing canvas
- **Features**:
  - Embedded canvas in notes
  - Drawing tools (pen, highlighter, shapes)
  - Multiple colors and sizes
  - Undo/redo
  - Export drawings as PNG/SVG
  - Tablet/stylus support
- **Technical**:
  - Library: Fabric.js or Excalidraw
  - Storage: Canvas data as JSON in note content
  - Rendering: Canvas API
- **Use Cases**: Diagrams, handwritten notes, annotations

### 📜 Version History
- **Priority**: High
- **Timeline**: June 2026
- **Description**: Track and restore previous versions
- **Features**:
  - Automatic version snapshots on save
  - View version history timeline
  - Diff view (compare versions)
  - Restore to any previous version
  - Version annotations
  - Configurable retention (30/90 days)
- **Technical**:
  - Database: `note_versions` table with full content
  - Backend: Snapshot on update (async)
  - Frontend: Timeline component, diff viewer
  - Storage: Consider compression for old versions
- **Retention Policy**: Keep all versions for 30 days, then weekly snapshots

---

## Phase 4: Media & Attachments (Rich Content)

**Status**: Research Phase  
**Timeline**: July 2026 - October 2026  
**Focus**: File storage, media handling, OCR

### 📎 File Attachment System
- **Priority**: High
- **Timeline**: July-August 2026
- **Description**: Attach files to notes
- **Features**:
  - Upload images, PDFs, documents
  - Drag and drop upload
  - File preview (images, PDFs)
  - Download attachments
  - File size limits and quotas
  - Thumbnail generation
  - Organize attachments in notes
- **Technical**:
  - Storage: S3-compatible (AWS S3, MinIO, DigitalOcean Spaces)
  - Database: `attachments` table with metadata
  - Backend: Multipart upload, virus scanning
  - Frontend: Dropzone component
  - Limits: 10MB per file, 1GB per user (configurable)
- **File Types**: Images (jpg, png, gif), PDFs, Office docs, text files

### 🔍 OCR for Image Search
- **Priority**: Medium
- **Timeline**: September 2026
- **Description**: Extract and search text from images
- **Features**:
  - Automatic OCR on image upload
  - Search text within images
  - Multiple languages support
  - Highlight matches in image viewer
  - Re-run OCR with different settings
- **Technical**:
  - OCR Engine: Tesseract via `pytesseract`
  - Background processing: Celery + Redis
  - Database: Store OCR text in `attachments.ocr_text`
  - Search: Include OCR text in full-text search
- **Languages**: English, Spanish, French, German, Chinese, Japanese
- **Performance**: Queue-based processing, ~5-30s per image

### ✅ Structured To-Do Lists
- **Priority**: Medium
- **Timeline**: October 2026
- **Description**: Native to-do list management
- **Features**:
  - Create checkbox lists in notes
  - Check/uncheck items
  - Progress indicators
  - Due dates on tasks
  - Priority levels
  - Filter by completed/pending
  - Convert notes to/from to-do lists
- **Technical**:
  - Database: `todo_items` table or extend structured notes
  - Schema: `{text, completed, due_date, priority}`
  - Frontend: Interactive checkbox component
  - Search: Filter by completion status
- **Integration**: Works with existing structured notes

---

## Phase 5: Polish (Professional Experience)

**Status**: Concept Stage  
**Timeline**: November 2026 - Q1 2027  
**Focus**: Customization, import/export, UX refinement

### ⌨️ Custom Keyboard Shortcuts
- **Priority**: Medium
- **Timeline**: November 2026
- **Description**: User-configurable shortcuts
- **Features**:
  - Customize all keyboard shortcuts
  - Import/export shortcut configs
  - Conflict detection
  - Reset to defaults
  - Per-action shortcut editor
  - Vim/Emacs presets
- **Technical**:
  - Frontend: Shortcut configuration UI
  - Storage: User preferences in database
  - Validation: Check for conflicts, invalid combos

### 🎨 Advanced Theming
- **Priority**: Low
- **Timeline**: December 2026
- **Description**: Custom theme builder
- **Features**:
  - Visual theme editor
  - Color picker for all elements
  - Font customization
  - Spacing/sizing controls
  - Preview while editing
  - Save custom themes
  - Share themes with community
- **Technical**:
  - Theme JSON with CSS variable mapping
  - Live preview with CSS injection
  - Theme marketplace (optional)

### 📥 Import Functionality
- **Priority**: High
- **Timeline**: December 2026
- **Description**: Import from other note apps
- **Features**:
  - Import from Evernote (.enex)
  - Import from Notion (export)
  - Import from OneNote
  - Import from plain Markdown files
  - Import from JSON/CSV
  - Batch import with progress
  - Duplicate detection
- **Technical**:
  - Backend: Parsers for each format
  - Async processing for large imports
  - Progress tracking via WebSocket
  - Tag mapping and creation

### 💬 Advanced Collaboration
- **Priority**: Medium
- **Timeline**: January 2027
- **Description**: Enhanced sharing features
- **Features**:
  - Comments on notes
  - Annotations with highlights
  - Activity feed (who did what)
  - Mention users (@username)
  - Notifications system
  - Conflict resolution UI
- **Technical**:
  - Database: `comments`, `annotations`, `activities`
  - Real-time: WebSocket for live updates
  - Notifications: Email/in-app

### 👥 Presence Indicators
- **Priority**: Low
- **Timeline**: February 2027
- **Description**: See who's online in shared notes
- **Features**:
  - Avatar indicators for active users
  - Cursor positions in collaborative editing
  - "Currently viewing" badges
  - Last seen timestamps
  - Activity status (typing, idle)
- **Technical**:
  - WebSocket for presence broadcasting
  - Heartbeat mechanism (every 30s)
  - Cleanup stale presences

---

## Future Considerations (Beyond Phase 5)

### Mobile Applications
- **Native iOS app** (React Native or Swift)
- **Native Android app** (React Native or Kotlin)
- Offline sync with conflict resolution
- Mobile-optimized UI
- Camera integration for quick notes

### API & Integrations
- **Public API** with rate limiting and OAuth
- **Webhooks** for external integrations
- **Zapier/Make integration**
- **Browser extensions** (Chrome, Firefox)
- **CLI tool** for power users

### Advanced Search
- **Semantic search** (vector embeddings)
- **Related notes** suggestions
- **Smart folders** (auto-categorize)
- **Duplicate detection**
- **Full regex support**

### Performance & Scale
- **Search service** (Elasticsearch/Meilisearch)
- **Caching layer** (Redis)
- **CDN** for media assets
- **Database read replicas**
- **Horizontal scaling**

### Enterprise Features
- **Team workspaces**
- **SSO/SAML authentication**
- **Audit logs**
- **Admin dashboard**
- **Usage analytics**
- **SLA guarantees**

---

## Community Involvement

We welcome community input on our roadmap!

### How to Influence the Roadmap

1. **Vote on features** in [GitHub Discussions](https://github.com/GeekTekRob/notes2gogo/discussions)
2. **Suggest new features** via [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
3. **Contribute code** - see [CONTRIBUTING.md](../CONTRIBUTING.md)
4. **Share use cases** - help us understand your needs
5. **Beta testing** - try new features early and provide feedback

### Feature Prioritization Criteria

We prioritize features based on:

1. **User impact** - How many users will benefit?
2. **Accessibility** - Does it improve accessibility?
3. **Effort** - Development time and complexity
4. **Dependencies** - Does it unlock other features?
5. **Community votes** - What do users want most?
6. **Strategic fit** - Aligns with our vision?

---

## Release Cadence

- **Major releases** (x.0.0): Every 3-4 months
- **Minor releases** (1.x.0): Monthly (new features)
- **Patch releases** (1.0.x): As needed (bug fixes)

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

---

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for detailed version history.

---

## Questions?

Have questions about the roadmap or want to suggest changes?

- 💬 [Start a discussion](https://github.com/GeekTekRob/notes2gogo/discussions)
- 📧 [Open an issue](https://github.com/GeekTekRob/notes2gogo/issues/new/choose)
- 📖 [Read the docs](./README.md)

---

**Last Updated**: October 29, 2025  
**Next Review**: December 2025
