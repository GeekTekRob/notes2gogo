# Notes2GoGo - Universal Notes Service

A lightweight, scalable, open-source notes service with a visual UI, flexible API, and support for both simple text notes and complex structured notes with rich-text formatting.

## ✨ Features

- **Dual Note Types**: Create simple Markdown text notes or structured key-value notes
- **Rich Text Editing**: Full Markdown support with live preview
- **Live Search**: Real-time filtering as you type - searches across titles, tags, and all content (including structured note sections)
- **User Authentication**: Secure JWT-based authentication system
- **Responsive UI**: Modern React interface with Tailwind CSS
- **Structured Note Editor**: Clean, card-based layout for section management with intuitive controls
- **RESTful API**: Complete FastAPI backend with auto-generated documentation
- **PostgreSQL Storage**: Robust database with JSONB support for flexible content
- **Docker Ready**: One-command deployment with Docker Compose
- **Modern Stack**: Python 3.11+, React 18, PostgreSQL 15
- **Debounced Search**: Efficient search with automatic debouncing to reduce server load

### 🏷️ Complete Tag System
- **Tag Management**: Create, rename, delete, and merge tags
- **Smart Autocomplete**: Tag suggestions as you type with real-time filtering
- **Advanced Filtering**: Filter notes by tags using AND/OR logic, or exclude specific tags
- **Bulk Operations**: Apply or remove tags from multiple notes at once
- **Tag Browser**: Sidebar showing all tags with note counts
- **Clickable Tags**: Click any tag to instantly filter notes
- **Visual Feedback**: Tag chips on note cards for quick identification

### 🔍 Search Analytics & Insights
- **Search Tracking**: Automatically tracks every search query with frequency and result counts
- **Smart Suggestions**: Real-time autocomplete based on your search history (min 2 characters)
- **Popular Searches**: Dashboard showing your most frequent searches
- **Trending Searches**: Identifies searches gaining popularity in the last 7 days
- **Search Statistics**: Overview of total searches, unique queries, and average results
- **Keyboard Navigation**: Arrow keys and Enter support in suggestion dropdown
- **Visual Indicators**: Fire icons for popular searches, trend arrows for trending queries
- **Privacy-First**: All analytics are per-user only, no cross-user tracking

## 🧭 Future Features Roadmap

Building Notes2GoGo into a truly universal note-taking application with accessibility-first design. Development is planned in four phases:

### Phase 1: Quick Wins (Core Enhancements)
- **✅ Tags System**: Complete tag creation, management, and filtering (COMPLETED)
- **✅ Search Analytics**: Track searches, provide smart suggestions, and show insights (COMPLETED)
- **Keyboard Shortcuts**: Essential shortcuts for note creation, saving, and navigation
- **Export Functionality**: Export notes as PDF and Markdown formats
- **Accessibility Labels**: Enhanced ARIA labels and screen reader support

### Phase 2: Core Features (Essential Functionality)
- **Folder Organization**: Hierarchical folder/notebook system for better organization
- **Natural Language Date Parsing**: Support for date expressions like "last-week", "yesterday", "today"
- **Saved Searches UI**: Frontend interface for creating and managing saved searches
- **In-Note Search Highlighting**: Highlight search terms within note content when viewing results
- **Full Keyboard Navigation**: Complete keyboard accessibility throughout the application
- **Theme Customization**: Expanded theme options including high-contrast and custom color schemes
- **Print Functionality**: Print-friendly views with layout customization

### Phase 3: Advanced Features (Power User Tools)
- **Real-time Collaboration**: Share notes and collaborate with others in real-time
- **Drawing/Sketch Support**: Integrated canvas for drawings and handwritten notes
- **Version History**: Track changes and restore previous versions of notes

### Phase 4: Media & Attachments (Rich Content)
- **File Attachment System**: Attach and manage images, PDFs, and media files within notes
- **OCR for Image Search**: Search text within images using optical character recognition
- **Structured To-Do Lists**: Native support for interactive to-do list management

### Phase 5: Polish (Professional Experience)

- **Custom Keyboard Shortcuts**: User-configurable keyboard shortcuts
- **Advanced Theming**: Custom color scheme builder with preview
- **Import Functionality**: Import notes from common formats and other note apps
- **Advanced Collaboration**: Comments, annotations, and activity feeds for shared notes
- **Presence Indicators**: See who's viewing or editing shared notes in real-time

Each phase builds upon the previous one, ensuring a stable and progressively enhanced user experience while maintaining our commitment to accessibility and universal design principles.

**Note**: Media-heavy features (file attachments, OCR, structured to-do lists) are separated into Phase 4 as they require significant infrastructure changes including file storage, processing pipelines, and extended database schemas.

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GeekTekRob/notes2gogo.git
   cd notes2gogo
   ```

2. **Start the application (minimal)**
   ```bash
   docker compose up -d
   ```
   Notes:
   - The backend automatically runs database migrations on startup.
   - Legacy helper scripts (start.ps1, setup-tag-system.ps1, TAG_SYSTEM_DEPLOYMENT.md) were removed.

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

That's it! The application will be running with a PostgreSQL database, FastAPI backend, and React frontend.

Optional: migrating legacy tag data

If you're upgrading from a version that stored tags in `tags_array`, run the one-time migration:

```bash
docker compose run --rm backend python migrate_tags_data.py
```

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Python 3.11+
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Migrations**: Alembic for database schema management
- **Validation**: Pydantic schemas for request/response validation

### Frontend (React)
- **Framework**: React 18 with Vite bundler
- **Styling**: Tailwind CSS with custom components
- **Routing**: React Router for client-side navigation
- **State Management**: Zustand for global state
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios with request/response interceptors
- **UI Features**: 
  - Live search with debouncing (300ms delay)
  - Clear search functionality with visual feedback
  - Responsive button layouts with proper icon alignment
  - Card-based structured note editor with intuitive section management

### Database Schema
- **Users**: Authentication and profile data
- **Notes**: Flexible content storage with JSONB for structured notes
- **Tags**: Organized tag system with many-to-many relationships
- **Note Tags**: Association table linking notes to tags
- **Saved Searches**: User-defined saved search queries with parameters
- **Folders**: Hierarchical folder organization (planned)
- **Search Analytics**: Per-user search tracking with frequency and result counts
- **Support**: Both simple text (Markdown) and structured (key-value) notes

## 🏷️ Using the Tag System

### Creating Tags
- **In Note Editor**: Use the tag input field with autocomplete - start typing and select from existing tags or create new ones
- **Press Enter, Comma, or Space**: To add a tag
- **Backspace**: Remove the last tag when input is empty

### Managing Tags
- **Tag Browser**: View all your tags with note counts in the sidebar on the dashboard
- **Rename**: Click the pencil icon next to any tag to rename it across all notes
- **Delete**: Click the trash icon to remove a tag from your system (notes remain intact)
- **Merge**: Combine duplicate or similar tags using the API endpoint

### Filtering with Tags
- **Click a Tag**: In the tag browser or on any note card to filter by that tag
- **Multi-Tag Filtering**: Use the API with `tag_filter_mode` parameter:
  - `and`: Notes must have ALL specified tags
  - `or`: Notes must have AT LEAST ONE of the specified tags
- **Exclude Tags**: Filter out notes with specific tags using the `exclude_tags` parameter

### Bulk Tag Operations
Use the `/api/notes/bulk-tag` endpoint to:
- **Add** tags to multiple notes at once
- **Remove** tags from multiple notes
- **Replace** all tags on selected notes

### API Examples

**Get all tags:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/tags/
```

**Filter notes by tag (AND logic):**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/notes/?tags=work,urgent&tag_filter_mode=and"
```

**Exclude notes with specific tags:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/notes/?exclude_tags=archive,draft"
```

**Bulk add tags to notes:**
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"note_ids":[1,2,3],"tag_names":["important"],"operation":"add"}' \
  http://localhost:8000/api/notes/bulk-tag
```

## � Using Search Analytics

### Smart Search Suggestions
- **Type to Get Suggestions**: Start typing in the search bar (minimum 2 characters)
- **Autocomplete Dropdown**: Shows relevant suggestions based on your search history
- **Keyboard Navigation**: 
  - `↑↓` Arrow keys to navigate suggestions
  - `Enter` to select a suggestion
  - `Escape` to close the dropdown
- **Visual Indicators**: Fire icons (🔥) mark frequently searched terms

### Search Insights Dashboard
Located in the sidebar, the Search Insights widget shows:
- **Quick Stats**: 
  - Total searches performed
  - Unique queries
  - Average results per search
  - Most searched query
- **Popular Searches**: Your most frequently searched terms with search counts
- **Trending Searches**: Queries gaining popularity in the last 7 days
- **Click to Search**: Click any query in the dashboard to execute it instantly

### API Examples

**Get search suggestions:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/analytics/suggestions?prefix=pro&limit=5"
```

**Get popular searches:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/analytics/popular?limit=10"
```

**Get trending searches:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/analytics/trending?limit=10&days=7"
```

**Get search statistics:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/analytics/stats
```

### Privacy & Data
- All search analytics are **per-user only**
- You can only see your own search history
- Data is automatically deleted when your account is deleted
- No cross-user tracking or global search trends

## 📚 API Documentation

### Analytics Endpoints
- `GET /api/analytics/popular` - Get most popular searches
  - Query parameters: `limit` (default: 10, max: 50)
- `GET /api/analytics/suggestions` - Get search suggestions for autocomplete
  - Query parameters: `prefix` (required), `limit` (default: 5, max: 20)
- `GET /api/analytics/trending` - Get trending searches
  - Query parameters: `limit` (default: 10, max: 50), `days` (default: 7, max: 30)
- `GET /api/analytics/stats` - Get overall search statistics

## �📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login (form data)
- `POST /api/auth/login-json` - User login (JSON)
- `GET /api/auth/me` - Get current user info

### Notes Endpoints
- `GET /api/notes/` - List notes (paginated, searchable)
  - Query parameters:
    - `page`: Page number (default: 1)
    - `per_page`: Items per page (default: 10, max: 100)
    - `search`: Search in title, tags, and content (both text and structured)
    - `note_type`: Filter by note type ('text' or 'structured')
    - `tags`: Filter by tags (comma-separated)
    - `tag_filter_mode`: Tag filter logic ('and', 'or', 'exclude')
    - `exclude_tags`: Exclude notes with these tags (comma-separated)
- `POST /api/notes/` - Create new note
- `GET /api/notes/{id}` - Get specific note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note
- `POST /api/notes/bulk-tag` - Bulk tag operations on multiple notes

### Tags Endpoints
- `GET /api/tags/` - List all tags with note counts
- `POST /api/tags/` - Create new tag
- `PUT /api/tags/{id}` - Rename tag
- `DELETE /api/tags/{id}` - Delete tag
- `POST /api/tags/merge` - Merge two tags
- `GET /api/tags/autocomplete` - Get tag suggestions (query param: `q`)

### Search Endpoints
- `POST /api/search` - Advanced search across notes
- `GET /api/search/saved` - List saved searches
- `POST /api/search/saved` - Create a saved search
- `GET /api/search/saved/{id}` - Get a saved search
- `POST /api/search/saved/{id}/execute` - Execute a saved search
- `PUT /api/search/saved/{id}` - Update a saved search
- `DELETE /api/search/saved/{id}` - Delete a saved search

Search request example:

```json
{
   "query": "intitle:meeting tag:work \"project plan\"",
   "tags": ["work"],
   "tag_mode": "and",
   "exclude_tags": ["archived"],
   "note_type": "text",
   "created_after": null,
   "created_before": null,
   "updated_after": null,
   "updated_before": null,
   "title_only": false,
   "has_attachments": null,
   "sort_by": "relevance",
   "page": 1,
   "per_page": 20
}
```

Supported operators in query:
- `intitle:term` (search in titles only)
- `tag:name` and `-tag:name` (include/exclude tags)
- `created:>=YYYY-MM-DD`, `updated:<YYYY-MM-DD` (date filters)
- `"exact phrase"` (exact phrase)
- `word1 NEAR/5 word2` (proximity search with optional distance)

### Note Types

#### Text Notes
```json
{
  "title": "My Text Note",
  "note_type": "text",
  "content": "# Heading\\n\\nThis is **markdown** content.",
  "tags": ["personal", "markdown"]
}
```

#### Structured Notes
```json
{
  "title": "My Structured Note",
  "note_type": "structured", 
  "content": {
    "Summary": "Project overview and goals",
    "Tasks": "- Complete API\\n- Test frontend\\n- Deploy",
    "Notes": "Remember to update documentation"
  },
  "tags": ["project", "work"]
}
```

## 🛠️ Development

### Backend Development

1. **Setup Python environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   pip install -r requirements.txt
   ```

2. **Environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

4. **Start development server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Development

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

### Database Management

**Create new migration**
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
```

**Apply migrations**
```bash
alembic upgrade head
```

**Rollback migration**
```bash
alembic downgrade -1
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://notes_user:notes_password@db:5432/notes2gogo
SECRET_KEY=your-super-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=["http://localhost"]
DEBUG=true
```

#### Frontend
```env
VITE_API_URL=http://localhost:8000
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 📦 Deployment

### Production
Use your preferred hosting. The provided docker-compose.yml is geared for local development. For production:
- Build and push your own images
- Configure environment variables and secrets securely
- Place a reverse proxy (nginx/Traefik) in front of the backend
- Serve the frontend via a CDN or static hosting

### Manual Deployment
1. Build frontend: `npm run build`
2. Setup PostgreSQL database
3. Configure environment variables
4. Run backend migrations: `alembic upgrade head`
5. Start backend: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
6. Serve frontend build with nginx/apache

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint/Prettier for JavaScript code
- Write tests for new features
- Update documentation as needed
- Use conventional commits

## 📋 Project Structure

```
notes2gogo/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core functionality
│   │   ├── models/         # SQLAlchemy models
│   │   └── schemas/        # Pydantic schemas
│   ├── alembic/            # Database migrations
│   ├── tests/              # Backend tests
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── store/          # State management
│   └── package.json        # Node dependencies
├── docker-compose.yml      # Development setup
└── README.md               # This file
```

## 🐛 Known Issues

- Large file uploads not yet supported
- Real-time collaboration features planned for v2.0
- Mobile app coming soon

## 🎯 Recent Updates

### Search Analytics & Insights (New!)
- **Smart Suggestions**: Autocomplete based on your search history
- **Popular Searches**: See your most frequently searched terms
- **Trending Searches**: Track queries gaining popularity
- **Search Statistics**: Total searches, unique queries, and averages
- **Privacy-First**: All analytics are per-user, no cross-user tracking

### UI/UX Improvements
- **Live Search**: Search now filters as you type with 300ms debouncing
- **Enhanced Search**: Searches across titles, tags, and all content (text and structured sections)
- **Better Button Layout**: Fixed button wrapping issues for cleaner appearance
- **Improved Structured Notes**: Card-based section editor with clear visual hierarchy
- **Clear Search**: Added "✕" button to quickly clear search input
- **Keyboard Navigation**: Full keyboard support in search suggestions

### Backend Improvements
- **Comprehensive Search**: SQLAlchemy queries now search in title, tags, content_text, and content_structured (JSONB)
- **Analytics Tracking**: Automatic search tracking with frequency and result counts
- **Performance**: Search debouncing reduces unnecessary API calls

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- FastAPI for the excellent Python web framework
- React team for the amazing frontend library
- PostgreSQL for reliable data storage
- All contributors and users of this project

## 📞 Support

- Create an issue for bug reports
- Start a discussion for feature requests
- Check the wiki for additional documentation

---

Made with ❤️ by the Notes2GoGo team