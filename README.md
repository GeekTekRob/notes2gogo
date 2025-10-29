# Notes2GoGo - Universal Notes Service

A lightweight, scalable, open-source notes service with a visual UI, flexible API, and support for both simple text notes and complex structured notes with rich-text formatting. **Now with comprehensive accessibility features and keyboard shortcuts!**

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

### ♿ Accessibility Features (NEW!)
- **Keyboard Shortcuts**: Power-user shortcuts for all common actions
  - `Alt+N`: Create new note
  - `Ctrl/Cmd+S`: Save note
  - `Ctrl/Cmd+K`: Focus search
  - `Ctrl/Cmd+\`: Toggle sidebar
  - `Ctrl/Cmd+B`: Bold text formatting
- **Full Screen Reader Support**: WCAG 2.1 AA compliant with comprehensive ARIA labels
- **Toast Notifications**: Visual and screen reader announcements for all actions
- **Enhanced Focus Indicators**: Clear keyboard navigation throughout
- **Keyboard Shortcuts Help**: Built-in help panel accessible anytime
- **100% Keyboard Navigable**: Complete functionality without a mouse
- **[Full Accessibility Guide →](./docs/ACCESSIBILITY.md)**

### 🏷️ Complete Tag System
- **Tag Management**: Create, rename, delete, and merge tags
- **Smart Autocomplete**: Tag suggestions as you type
- **Advanced Filtering**: Filter by tags with AND/OR logic
- **Bulk Operations**: Apply or remove tags from multiple notes
- **Tag Browser**: Sidebar with all tags and note counts
- **[Full Tag Guide →](./docs/TAGS.md)**

### 🔍 Search Analytics & Insights
- **Search Tracking**: Automatic tracking with frequency and result counts
- **Smart Suggestions**: Autocomplete based on your search history
- **Popular & Trending**: Dashboard showing frequent and trending searches
- **Keyboard Navigation**: Full keyboard support in suggestions
- **Privacy-First**: Per-user analytics only, no cross-user tracking
- **[Full Search Analytics Guide →](./docs/SEARCH_ANALYTICS.md)**

## 🧭 Future Features Roadmap

Building Notes2GoGo into a truly universal note-taking application with accessibility-first design. Development is planned in four phases:

### Phase 1: Quick Wins (Core Enhancements) ✅ COMPLETE
- **✅ Tags System**: Complete tag creation, management, and filtering
- **✅ Search Analytics**: Track searches, provide smart suggestions, and show insights
- **✅ Keyboard Shortcuts**: Essential shortcuts for note creation, saving, and navigation
- **✅ Accessibility Labels**: Enhanced ARIA labels and screen reader support (WCAG 2.1 AA)
- **Export Functionality**: Export notes as PDF and Markdown formats (Coming Soon)

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

## 📚 Documentation

**📖 [Complete Documentation](./docs/)** - Comprehensive guides and references

### Quick Links
- **[Tag System Guide](./docs/TAGS.md)** - Organizing notes with tags
- **[Search Analytics Guide](./docs/SEARCH_ANALYTICS.md)** - Smart search and insights
- **[Accessibility Guide](./docs/ACCESSIBILITY.md)** - Keyboard shortcuts and WCAG compliance
- **[API Reference](./docs/API.md)** - Complete REST API documentation
- **[Contributing Guide](./docs/CONTRIBUTING.md)** - How to contribute

### API Documentation
- **Interactive Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

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

For detailed API endpoint documentation, see **[API Reference](./docs/API.md)**.

---

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
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── store/          # State management
│   └── package.json        # Node dependencies
├── docs/                   # Documentation
│   ├── README.md           # Documentation index
│   ├── ACCESSIBILITY.md    # Accessibility guide
│   ├── API.md              # API reference
│   ├── TAGS.md             # Tag system guide
│   ├── SEARCH_ANALYTICS.md # Search analytics guide
│   └── CONTRIBUTING.md     # Contribution guidelines
├── docker-compose.yml      # Development setup
├── CHANGELOG.md            # Version history
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