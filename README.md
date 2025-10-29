# Notes2GoGo - Universal Notes Service

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/GeekTekRob/notes2gogo)
![GitHub issues](https://img.shields.io/github/issues/GeekTekRob/notes2gogo)
![GitHub pull requests](https://img.shields.io/github/issues-pr/GeekTekRob/notes2gogo)
![Contributors](https://img.shields.io/github/contributors/GeekTekRob/notes2gogo)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Code Coverage](https://img.shields.io/badge/coverage-85%25-yellowgreen.svg)

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

- Docker & Docker Compose (recommended)
- **OR** Python 3.11+, Node.js 18+, PostgreSQL 15+ (manual setup)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GeekTekRob/notes2gogo.git
   cd notes2gogo
   ```

2. **Configure environment variables**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Edit files with your settings (especially SECRET_KEY and database credentials)
   ```

3. **Start the application with Docker**
   ```bash
   docker compose up -d
   ```
   
   **OR** for manual setup, see our **[Development Guide](./docs/DEVELOPMENT.md)**

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

**Notes:**
- The backend automatically runs database migrations on startup
- For troubleshooting, see the **[Development Guide](./docs/DEVELOPMENT.md)** with 15+ common issue solutions
- For production deployment, see the **[Deployment Guide](./docs/DEPLOYMENT.md)**

### Optional: Migrating Legacy Tag Data

If you're upgrading from a version that stored tags in `tags_array`, run the one-time migration:

```bash
docker compose run --rm backend python migrate_tags_data.py
```

## 📚 Documentation

**📖 [Complete Documentation](./docs/)** - Comprehensive guides and references organized into categories

### Getting Started
- **[FAQ - Frequently Asked Questions](./docs/FAQ.md)** - 60+ common questions across 9 categories (getting started, features, technical, troubleshooting, contributing, privacy, deployment, and roadmap)
- **[Development Setup Guide](./docs/DEVELOPMENT.md)** - Complete setup instructions, troubleshooting for 15+ common issues, testing, debugging, and daily workflow

### User Guides
- **[Tag System Guide](./docs/TAGS.md)** - Complete guide to organizing notes with tags, filtering, bulk operations, and best practices
- **[Search Analytics Guide](./docs/SEARCH_ANALYTICS.md)** - Smart search features, autocomplete suggestions, trending searches, and privacy-first analytics
- **[Accessibility Guide](./docs/ACCESSIBILITY.md)** - WCAG 2.1 AA compliance, keyboard shortcuts, screen reader support, and inclusive design features

### Developer Documentation
- **[Architecture Guide](./docs/ARCHITECTURE.md)** - System design, database ERD, technology stack, data flow diagrams, security architecture, and scalability strategies
- **[API Reference](./docs/API.md)** - Complete REST API documentation with all endpoints, request/response schemas, and authentication
- **[API Examples](./docs/API_EXAMPLES.md)** - Practical code examples using curl, HTTPie, and JavaScript for all API endpoints
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute: setup, coding standards, testing guidelines, commit conventions, and PR process

### Deployment & Operations
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment strategies for Docker, Kubernetes, cloud platforms (AWS, DigitalOcean, Heroku), security hardening, monitoring, and backup procedures
- **[Environment Configuration](./.env.example)** - Template for all required environment variables (see also [backend/.env.example](./backend/.env.example) and [frontend/.env.example](./frontend/.env.example))

### Reference Documentation
- **[Roadmap](./docs/ROADMAP.md)** - Detailed feature planning through 2027 with 5 phases, timelines, and community involvement opportunities
- **[Changelog](./CHANGELOG.md)** - Complete version history and recent updates
- **[Code of Conduct](./CODE_OF_CONDUCT.md)** - Community standards based on Contributor Covenant 2.1
- **[Security Policy](./SECURITY.md)** - Security best practices and vulnerability reporting procedures

### Interactive Documentation
- **Interactive Swagger UI**: http://localhost:8000/docs
- **ReDoc Alternative**: http://localhost:8000/redoc

### GitHub Community Resources
- **[Bug Report Template](./.github/ISSUE_TEMPLATE/bug_report.md)** - Report bugs with structured information
- **[Feature Request Template](./.github/ISSUE_TEMPLATE/feature_request.md)** - Suggest new features aligned with our roadmap
- **[Question Template](./.github/ISSUE_TEMPLATE/question.md)** - Ask questions about usage or implementation
- **[Pull Request Template](./.github/PULL_REQUEST_TEMPLATE.md)** - Submit code contributions with our checklist

---

## 🏗️ Project Architecture

### Technology Stack

**Backend (FastAPI)**
- **Framework**: FastAPI with Python 3.11+
- **Database**: PostgreSQL 15 with SQLAlchemy ORM and Alembic migrations
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Pydantic schemas for request/response validation
- **Testing**: pytest with comprehensive test coverage

**Frontend (React)**
- **Framework**: React 18 with Vite bundler
- **Styling**: Tailwind CSS with custom components
- **Routing**: React Router v6 for client-side navigation
- **State Management**: Zustand for global state
- **Forms**: React Hook Form with Yup validation
- **HTTP Client**: Axios with request/response interceptors
- **Testing**: Jest and React Testing Library

**Infrastructure**
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for local development
- **Database**: PostgreSQL with JSONB support for flexible content
- **Deployment**: Ready for Kubernetes, cloud platforms (AWS, DigitalOcean, Heroku)

### Database Schema

The application uses a relational database with JSONB for flexible content:

- **Users**: Authentication and profile data
- **Notes**: Flexible content storage (text or structured) with JSONB
- **Tags**: Organized tag system with hierarchical support
- **Note Tags**: Many-to-many relationship linking notes to tags
- **Saved Searches**: User-defined saved search queries with parameters
- **Search Analytics**: Per-user search tracking with frequency and result counts
- **Folders**: Hierarchical folder organization (Phase 2)

For detailed architecture including ERD diagrams, data flow, and scalability strategies, see the **[Architecture Guide](./docs/ARCHITECTURE.md)**.

### API Overview

**Authentication Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

**Notes Endpoints**
- `GET /api/notes` - List notes with search and filtering
- `POST /api/notes` - Create new note
- `GET /api/notes/{id}` - Get specific note
- `PUT /api/notes/{id}` - Update note
- `DELETE /api/notes/{id}` - Delete note

**Tags Endpoints**
- `GET /api/tags` - List all tags with note counts
- `POST /api/tags` - Create new tag
- `PUT /api/tags/{id}` - Rename tag
- `DELETE /api/tags/{id}` - Delete tag
- `POST /api/tags/merge` - Merge multiple tags
- `POST /api/notes/{id}/tags` - Bulk tag operations

**Search & Analytics Endpoints**
- `GET /api/analytics/search-suggestions` - Autocomplete suggestions
- `GET /api/analytics/dashboard` - Search analytics dashboard
- `GET /api/analytics/search-history` - Recent searches

For complete API documentation with examples, see:
- **[API Reference](./docs/API.md)** - Full endpoint documentation
- **[API Examples](./docs/API_EXAMPLES.md)** - Practical curl, HTTPie, and JavaScript examples

---

## 🛠️ Development

For comprehensive development setup, troubleshooting, testing, and best practices, see the **[Development Guide](./docs/DEVELOPMENT.md)**.

### Quick Development Setup

**Backend Development**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Edit with your settings
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend Development**
```bash
cd frontend
npm install
cp .env.example .env  # Edit with your settings
npm run dev
```

### Database Migrations

```bash
cd backend
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# With coverage
pytest --cov=app
npm test -- --coverage
```

### Common Issues

The **[Development Guide](./docs/DEVELOPMENT.md)** includes detailed solutions for 15+ common problems:
- ModuleNotFoundError and import issues
- Database connection problems
- Migration conflicts
- npm/Docker issues
- CORS errors
- And much more...

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. Template files are provided:

- **[Root .env.example](./.env.example)** - Docker Compose variables (database, production settings)
- **[Backend .env.example](./backend/.env.example)** - Backend API configuration (JWT, CORS, database, security)
- **[Frontend .env.example](./frontend/.env.example)** - Frontend build configuration (API URL, feature flags)

**Key Variables:**

```bash
# Backend (backend/.env)
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-secret-key-generate-with-secrets-module
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=["http://localhost:3000"]
ENVIRONMENT=development
DEBUG=true

# Frontend (frontend/.env)
VITE_API_URL=http://localhost:8000
```

**Security Notes:**
- Never commit `.env` files to version control (already in `.gitignore`)
- Always change `SECRET_KEY` in production (generate with `python -c "import secrets; print(secrets.token_urlsafe(64))"`)
- Set `DEBUG=false` in production
- Use HTTPS URLs in production `ALLOWED_ORIGINS`
- See **[Security Policy](./SECURITY.md)** for best practices

For comprehensive environment setup and production configuration, see the **[Deployment Guide](./docs/DEPLOYMENT.md)**.

## 🧪 Testing

### Running Tests

```bash
# Backend tests with pytest
cd backend
pytest

# With coverage report
pytest --cov=app --cov-report=html

# Frontend tests with Jest
cd frontend
npm test

# With coverage
npm test -- --coverage

# End-to-end tests
npm run test:e2e
```

### Test Coverage

The project maintains high test coverage across both backend and frontend:
- **Backend**: 85%+ coverage of core functionality
- **Frontend**: Comprehensive component and integration tests
- **API**: All endpoints have test coverage

For detailed testing guidelines, CI/CD setup, and best practices, see:
- **[Development Guide](./docs/DEVELOPMENT.md)** - Testing section
- **[Contributing Guide](./CONTRIBUTING.md)** - Testing requirements for contributions

## 📦 Deployment

For comprehensive production deployment guidance, see the **[Deployment Guide](./docs/DEPLOYMENT.md)** which covers:

- **Docker Deployment**: Production-ready Docker configurations with security hardening
- **Kubernetes**: Complete K8s manifests with secrets management, scaling, and ingress
- **Cloud Platforms**: Step-by-step guides for AWS (RDS, ECS, ECR), DigitalOcean, and Heroku
- **Manual Deployment**: Traditional server setup on Ubuntu with systemd, nginx, SSL
- **Security Hardening**: Firewall configuration, fail2ban, SSL certificates, secure headers
- **Monitoring & Logging**: Sentry, Prometheus, Grafana, log aggregation
- **Backup & Recovery**: Database backup strategies and disaster recovery procedures

### Quick Production Checklist

Before deploying to production:

1. ✅ Update all environment variables (use `.env.example` templates)
2. ✅ Generate strong `SECRET_KEY`: `python -c "import secrets; print(secrets.token_urlsafe(64))"`
3. ✅ Set `DEBUG=false` and `ENVIRONMENT=production`
4. ✅ Configure HTTPS and update `ALLOWED_ORIGINS` with production domains
5. ✅ Set up managed PostgreSQL database (AWS RDS, DigitalOcean, etc.)
6. ✅ Configure SSL certificates (Let's Encrypt recommended)
7. ✅ Set up monitoring and error tracking (Sentry)
8. ✅ Configure automated database backups
9. ✅ Set up firewall rules and fail2ban
10. ✅ Test migrations on staging environment first

### Deployment Options

**Option 1: Docker (Recommended)**
```bash
# Build images
docker compose -f docker-compose.prod.yml build

# Run migrations
docker compose run --rm backend alembic upgrade head

# Start services
docker compose -f docker-compose.prod.yml up -d
```

**Option 2: Cloud Platform**
- See [AWS deployment guide](./docs/DEPLOYMENT.md#aws-deployment)
- See [DigitalOcean deployment guide](./docs/DEPLOYMENT.md#digitalocean-deployment)
- See [Heroku deployment guide](./docs/DEPLOYMENT.md#heroku-deployment)

**Option 3: Manual Server Setup**
- See [manual deployment guide](./docs/DEPLOYMENT.md#manual-deployment)

## 🤝 Contributing

We welcome contributions! Please see our **[Contributing Guide](CONTRIBUTING.md)** for details on:

- Setting up your development environment
- Coding standards and best practices
- Testing guidelines
- Commit message conventions
- Pull request process

**Quick Start for Contributors:**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following our [coding standards](CONTRIBUTING.md#coding-standards)
4. Write tests and ensure they pass
5. Commit using [conventional commits](CONTRIBUTING.md#git-commit-messages)
6. Open a Pull Request using our [PR template](.github/PULL_REQUEST_TEMPLATE.md)

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 📋 Project Structure

```
notes2gogo/
├── .github/                    # GitHub configuration
│   ├── ISSUE_TEMPLATE/         # Issue templates (bug, feature, question)
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   ├── question.md
│   │   └── config.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/                # API route handlers
│   │   │   ├── analytics.py    # Search analytics endpoints
│   │   │   ├── auth.py         # Authentication endpoints
│   │   │   ├── folders.py      # Folder management (Phase 2)
│   │   │   ├── notes.py        # Notes CRUD endpoints
│   │   │   └── tags.py         # Tag management endpoints
│   │   ├── core/               # Core functionality
│   │   │   ├── config.py       # Configuration management
│   │   │   ├── database.py     # Database connection
│   │   │   └── security.py     # JWT and password hashing
│   │   ├── models/             # SQLAlchemy database models
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── services/           # Business logic
│   │   │   └── search.py       # Full-text search service
│   │   └── utils/              # Utility functions
│   │       └── date_parser.py  # Natural language date parsing
│   ├── alembic/                # Database migrations
│   │   └── versions/           # Migration scripts
│   ├── tests/                  # Backend tests (pytest)
│   ├── .env.example            # Backend environment template
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile              # Backend container
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   │   ├── AdvancedFilters.jsx
│   │   │   ├── FolderBrowser.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── TagInput.jsx
│   │   │   ├── TagManager.jsx
│   │   │   ├── SavedSearches.jsx
│   │   │   └── SearchAnalytics.jsx
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── NoteEditorPage.jsx
│   │   │   ├── NoteViewPage.jsx
│   │   │   └── SearchResultsPage.jsx
│   │   ├── services/           # API client services
│   │   │   └── api.js
│   │   ├── store/              # Zustand state management
│   │   │   ├── authStore.js
│   │   │   ├── notesStore.js
│   │   │   ├── searchStore.js
│   │   │   └── themeStore.js
│   │   └── utils/              # Frontend utilities
│   ├── .env.example            # Frontend environment template
│   ├── package.json            # Node dependencies
│   ├── tailwind.config.js      # Tailwind CSS config
│   └── Dockerfile              # Frontend container
├── docs/                       # Documentation
│   ├── README.md               # Documentation index
│   ├── ACCESSIBILITY.md        # Accessibility features guide
│   ├── API.md                  # Complete API reference
│   ├── API_EXAMPLES.md         # Practical API examples
│   ├── ARCHITECTURE.md         # System design & ERD
│   ├── DEPLOYMENT.md           # Production deployment guide
│   ├── DEVELOPMENT.md          # Setup & troubleshooting
│   ├── FAQ.md                  # 60+ frequently asked questions
│   ├── ROADMAP.md              # Feature planning (5 phases)
│   ├── SEARCH_ANALYTICS.md     # Search features guide
│   └── TAGS.md                 # Tag system guide
├── .env.example                # Root environment template (Docker)
├── .gitignore                  # Git ignore rules (secrets protected)
├── CHANGELOG.md                # Version history
├── CODE_OF_CONDUCT.md          # Community guidelines
├── CONTRIBUTING.md             # Contribution guide
├── docker-compose.yml          # Local development setup
├── init-db.sql                 # Database initialization
├── LICENSE                     # MIT License
├── README.md                   # This file
└── SECURITY.md                 # Security policy

```

For detailed architecture and component interaction, see the **[Architecture Guide](./docs/ARCHITECTURE.md)**.

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

- 🐛 **Bug Reports**: Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- ✨ **Feature Requests**: Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- ❓ **Questions**: Use our [question template](.github/ISSUE_TEMPLATE/question.md) or [GitHub Discussions](https://github.com/GeekTekRob/notes2gogo/discussions)
- 🔒 **Security Issues**: See our [Security Policy](SECURITY.md)
- 📖 **Documentation**: Check our [comprehensive docs](./docs/)

---

Made with ❤️ by the Notes2GoGo team