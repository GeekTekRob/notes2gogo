# 🏗️ Architecture Documentation

This document provides a comprehensive overview of the Notes2GoGo system architecture, database design, and data flow.

---

## Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Architecture Patterns](#architecture-patterns)
- [Database Schema](#database-schema)
- [API Design](#api-design)
- [Frontend Architecture](#frontend-architecture)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Scalability Considerations](#scalability-considerations)

---

## System Overview

Notes2GoGo is a three-tier web application built on modern web technologies:

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         React 18 SPA with Vite                         │ │
│  │  - Component-based UI                                   │ │
│  │  - Zustand state management                            │ │
│  │  - React Router navigation                             │ │
│  │  - Axios HTTP client                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/HTTPS (REST)
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         FastAPI Backend (Python 3.11+)                 │ │
│  │  - RESTful API endpoints                               │ │
│  │  - JWT authentication                                  │ │
│  │  - Pydantic validation                                 │ │
│  │  - Business logic layer                                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕ SQLAlchemy ORM
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         PostgreSQL 15+                                 │ │
│  │  - Relational data storage                             │ │
│  │  - JSONB for flexible content                          │ │
│  │  - Full-text search (GIN indexes)                      │ │
│  │  - ACID compliance                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy 2.0+
- **Database**: PostgreSQL 15+
- **Migration**: Alembic
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **Validation**: Pydantic 2.0+
- **ASGI Server**: Uvicorn

### Frontend
- **Framework**: React 18.2+
- **Build Tool**: Vite 5.0+
- **Styling**: Tailwind CSS 3.3+
- **State Management**: Zustand 4.4+
- **Routing**: React Router 6.20+
- **HTTP Client**: Axios 1.6+
- **Form Handling**: React Hook Form + Yup
- **Icons**: Heroicons

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (production)
- **Reverse Proxy**: Nginx/Traefik (production)

---

## Architecture Patterns

### Backend Patterns

#### 1. Layered Architecture
```
┌─────────────────────────────────────┐
│         API Layer (Routes)          │  ← HTTP requests/responses
├─────────────────────────────────────┤
│       Business Logic (Services)     │  ← Application logic
├─────────────────────────────────────┤
│      Data Access (Models/ORM)       │  ← Database operations
├─────────────────────────────────────┤
│         Database (PostgreSQL)       │  ← Persistent storage
└─────────────────────────────────────┘
```

**Example Flow:**
1. **API Layer** (`app/api/notes.py`): Receives HTTP request
2. **Schema Validation** (`app/schemas/`): Validates input with Pydantic
3. **Business Logic** (inline or `app/services/`): Processes request
4. **Data Access** (`app/models/`): SQLAlchemy queries database
5. **Response**: Serialized with Pydantic, returned as JSON

#### 2. Dependency Injection
FastAPI's dependency injection system manages:
- Database sessions (`get_db`)
- Authentication (`get_current_user`)
- Configuration (`Settings`)

```python
@router.get("/notes/")
def get_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
):
    # Function automatically receives injected dependencies
    pass
```

#### 3. Repository Pattern (Implicit)
SQLAlchemy ORM acts as a repository, abstracting database operations:
```python
# app/models/__init__.py acts as repository interface
db.query(Note).filter(Note.user_id == user_id).all()
```

### Frontend Patterns

#### 1. Component-Based Architecture
```
App
├── Layout Components
│   ├── Navbar
│   └── ToastContainer
├── Page Components
│   ├── HomePage
│   ├── DashboardPage
│   ├── NoteEditorPage
│   └── NoteViewPage
├── Feature Components
│   ├── SearchBar
│   ├── TagManager
│   ├── FolderBrowser
│   └── SavedSearches
└── Utility Components
    ├── Toast
    ├── KeyboardShortcuts
    └── ProtectedRoute
```

#### 2. Custom Hooks Pattern
Encapsulates reusable logic:
- `useKeyboardShortcuts`: Global keyboard shortcuts
- `useAnnouncement`: Screen reader announcements
- `useTextFormatting`: Text formatting utilities

#### 3. State Management
**Zustand Stores:**
- `authStore`: User authentication state
- `notesStore`: Notes CRUD operations
- `searchStore`: Search state and filters
- `themeStore`: Theme preferences

**Local State:**
- Component-specific state with `useState`
- Form state with React Hook Form

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│    users    │
├─────────────┤
│ id (PK)     │─────────┐
│ username    │         │
│ email       │         │ One-to-Many
│ password    │         │
│ created_at  │         │
└─────────────┘         │
                        │
                        ↓
              ┌─────────────────┐
              │     notes       │
              ├─────────────────┤
              │ id (PK)         │───────┐
              │ user_id (FK)    │       │
              │ title           │       │ Many-to-Many
              │ note_type       │       │  (via note_tags)
              │ content_text    │       │
              │ content_struct  │       │
              │ created_at      │       │
              │ updated_at      │       │
              └─────────────────┘       │
                        │               │
                        │               │
         ┌──────────────┼───────────────┘
         │              │
         │              ↓
         │    ┌──────────────────┐
         │    │    note_tags     │
         │    ├──────────────────┤
         │    │ note_id (FK, PK) │
         │    │ tag_id (FK, PK)  │
         │    └──────────────────┘
         │              │
         │              │
         │              ↓
         │    ┌─────────────┐
         │    │    tags     │
         │    ├─────────────┤
         └───→│ id (PK)     │
              │ user_id (FK)│
              │ name        │
              │ created_at  │
              └─────────────┘

┌──────────────────────┐
│  saved_searches      │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │──→ users.id
│ name                 │
│ query_params (JSONB) │
│ created_at           │
└──────────────────────┘

┌──────────────────────┐
│  search_analytics    │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │──→ users.id
│ query_text           │
│ result_count         │
│ search_timestamp     │
└──────────────────────┘

┌──────────────────────┐
│  folders             │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │──→ users.id
│ parent_id (FK, Self) │
│ name                 │
│ created_at           │
└──────────────────────┘
     ↑
     │ (Not yet implemented)
     │
┌──────────────────────┐
│  note_folders        │
├──────────────────────┤
│ note_id (FK)         │
│ folder_id (FK)       │
└──────────────────────┘
```

### Table Definitions

#### **users**
Primary entity for authentication and ownership.

| Column       | Type         | Constraints                    | Description                      |
|--------------|--------------|--------------------------------|----------------------------------|
| id           | INTEGER      | PRIMARY KEY, AUTO INCREMENT    | User unique identifier           |
| username     | VARCHAR(50)  | UNIQUE, NOT NULL               | Username for login               |
| email        | VARCHAR(255) | UNIQUE, NOT NULL               | User email address               |
| password_hash| VARCHAR(255) | NOT NULL                       | Bcrypt hashed password           |
| created_at   | TIMESTAMP    | DEFAULT NOW()                  | Account creation timestamp       |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE on `username`
- UNIQUE on `email`

---

#### **notes**
Core entity storing note content.

| Column           | Type         | Constraints                    | Description                           |
|------------------|--------------|--------------------------------|---------------------------------------|
| id               | INTEGER      | PRIMARY KEY, AUTO INCREMENT    | Note unique identifier                |
| user_id          | INTEGER      | FOREIGN KEY (users.id), NOT NULL | Owner of the note                   |
| title            | VARCHAR(255) | NOT NULL                       | Note title                            |
| note_type        | VARCHAR(20)  | NOT NULL                       | Type: 'text' or 'structured'          |
| content_text     | TEXT         | NULL                           | Markdown content (text notes)         |
| content_structured | JSONB      | NULL                           | Key-value pairs (structured notes)    |
| created_at       | TIMESTAMP    | DEFAULT NOW()                  | Creation timestamp                    |
| updated_at       | TIMESTAMP    | DEFAULT NOW()                  | Last update timestamp                 |

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY on `user_id` → `users.id`
- GIN index on `content_structured` for JSONB queries
- GIN index on `to_tsvector(content_text)` for full-text search
- Index on `user_id, created_at DESC` for efficient listing

**Constraints:**
- `CHECK (note_type IN ('text', 'structured'))`
- `CHECK ((note_type = 'text' AND content_text IS NOT NULL) OR (note_type = 'structured' AND content_structured IS NOT NULL))`

---

#### **tags**
User-specific tags for categorization.

| Column     | Type         | Constraints                    | Description                  |
|------------|--------------|--------------------------------|------------------------------|
| id         | INTEGER      | PRIMARY KEY, AUTO INCREMENT    | Tag unique identifier        |
| user_id    | INTEGER      | FOREIGN KEY (users.id), NOT NULL | Owner of the tag           |
| name       | VARCHAR(50)  | NOT NULL                       | Tag name                     |
| created_at | TIMESTAMP    | DEFAULT NOW()                  | Tag creation timestamp       |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE on `(user_id, name)` (per-user unique tag names)
- FOREIGN KEY on `user_id` → `users.id`

---

#### **note_tags**
Many-to-many junction table.

| Column  | Type    | Constraints                    | Description                  |
|---------|---------|--------------------------------|------------------------------|
| note_id | INTEGER | FOREIGN KEY (notes.id), NOT NULL | Note reference             |
| tag_id  | INTEGER | FOREIGN KEY (tags.id), NOT NULL  | Tag reference              |

**Indexes:**
- PRIMARY KEY on `(note_id, tag_id)`
- FOREIGN KEY on `note_id` → `notes.id` (CASCADE DELETE)
- FOREIGN KEY on `tag_id` → `tags.id` (CASCADE DELETE)
- Index on `tag_id` for reverse lookups

---

#### **saved_searches**
User-defined search queries for quick access.

| Column        | Type         | Constraints                    | Description                     |
|---------------|--------------|--------------------------------|---------------------------------|
| id            | INTEGER      | PRIMARY KEY, AUTO INCREMENT    | Search unique identifier        |
| user_id       | INTEGER      | FOREIGN KEY (users.id), NOT NULL | Owner of the search           |
| name          | VARCHAR(100) | NOT NULL                       | Search display name             |
| query_params  | JSONB        | NOT NULL                       | Search parameters (filters, etc)|
| created_at    | TIMESTAMP    | DEFAULT NOW()                  | Creation timestamp              |

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY on `user_id` → `users.id`
- Index on `user_id` for efficient user queries

---

#### **search_analytics**
Tracks search queries for insights and suggestions.

| Column           | Type         | Constraints                    | Description                     |
|------------------|--------------|--------------------------------|---------------------------------|
| id               | INTEGER      | PRIMARY KEY, AUTO INCREMENT    | Analytics record identifier     |
| user_id          | INTEGER      | FOREIGN KEY (users.id), NOT NULL | User who performed search     |
| query_text       | VARCHAR(255) | NOT NULL                       | Search query string             |
| result_count     | INTEGER      | NOT NULL                       | Number of results returned      |
| search_timestamp | TIMESTAMP    | DEFAULT NOW()                  | When search was performed       |

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY on `user_id` → `users.id`
- Index on `(user_id, query_text)` for frequency aggregation
- Index on `(user_id, search_timestamp DESC)` for recent searches

---

#### **folders** (Phase 2)
Hierarchical folder structure for organization.

| Column     | Type         | Constraints                    | Description                     |
|------------|--------------|--------------------------------|---------------------------------|
| id         | INTEGER      | PRIMARY KEY, AUTO INCREMENT    | Folder unique identifier        |
| user_id    | INTEGER      | FOREIGN KEY (users.id), NOT NULL | Owner of the folder           |
| parent_id  | INTEGER      | FOREIGN KEY (folders.id), NULL   | Parent folder (NULL = root)   |
| name       | VARCHAR(100) | NOT NULL                       | Folder name                     |
| created_at | TIMESTAMP    | DEFAULT NOW()                  | Creation timestamp              |

**Indexes:**
- PRIMARY KEY on `id`
- FOREIGN KEY on `user_id` → `users.id`
- FOREIGN KEY on `parent_id` → `folders.id` (self-referencing)
- Index on `(user_id, parent_id)` for hierarchy traversal

---

## API Design

### RESTful Principles

Notes2GoGo follows REST conventions:

| HTTP Method | Endpoint Pattern      | Purpose                      | Idempotent |
|-------------|-----------------------|------------------------------|------------|
| GET         | `/resource`           | List resources               | Yes        |
| GET         | `/resource/{id}`      | Retrieve single resource     | Yes        |
| POST        | `/resource`           | Create new resource          | No         |
| PUT         | `/resource/{id}`      | Replace entire resource      | Yes        |
| PATCH       | `/resource/{id}`      | Partial update               | No         |
| DELETE      | `/resource/{id}`      | Delete resource              | Yes        |

### Authentication Flow

```
┌──────────┐                                  ┌──────────┐
│  Client  │                                  │  Server  │
└────┬─────┘                                  └────┬─────┘
     │                                             │
     │ POST /api/auth/login                        │
     │ {username, password}                        │
     ├────────────────────────────────────────────>│
     │                                             │
     │                         Validate credentials│
     │                         Generate JWT token  │
     │                                             │
     │ 200 OK                                      │
     │ {access_token, token_type}                  │
     │<────────────────────────────────────────────┤
     │                                             │
     │ Store token in memory/localStorage          │
     │                                             │
     │ GET /api/notes/                             │
     │ Authorization: Bearer {token}               │
     ├────────────────────────────────────────────>│
     │                                             │
     │                              Verify JWT     │
     │                              Extract user_id│
     │                              Fetch notes    │
     │                                             │
     │ 200 OK                                      │
     │ [{note1}, {note2}, ...]                     │
     │<────────────────────────────────────────────┤
     │                                             │
```

**JWT Token Structure:**
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "username",
    "exp": 1698765432
  },
  "signature": "..."
}
```

### Request/Response Cycle

```
1. Client Request
   ↓
2. CORS Middleware (check origin)
   ↓
3. Route Matching
   ↓
4. Dependency Injection (DB session, auth)
   ↓
5. Request Validation (Pydantic schema)
   ↓
6. Business Logic
   ↓
7. Database Query (SQLAlchemy)
   ↓
8. Response Serialization (Pydantic)
   ↓
9. HTTP Response
```

---

## Frontend Architecture

### Component Hierarchy

```
App.jsx (Root)
│
├── ToastProvider (Context)
│   └── ToastContainer
│
├── AuthenticatedLayout
│   ├── Navbar
│   │   ├── Logo
│   │   ├── Navigation Links
│   │   └── User Menu
│   │
│   ├── KeyboardShortcuts (Help Modal)
│   │
│   └── Router Outlet
│       │
│       ├── HomePage
│       │   └── Hero Section
│       │
│       ├── DashboardPage
│       │   ├── SearchBar
│       │   │   └── SearchAnalytics (suggestions)
│       │   ├── AdvancedFilters
│       │   ├── Sidebar
│       │   │   ├── TagManager
│       │   │   ├── FolderBrowser
│       │   │   └── SavedSearches
│       │   └── NotesList
│       │       └── NoteCard[]
│       │
│       ├── NoteEditorPage
│       │   ├── TitleInput
│       │   ├── TagInput (autocomplete)
│       │   ├── ContentEditor (Markdown or Structured)
│       │   └── SaveButton
│       │
│       └── NoteViewPage
│           ├── NoteHeader (title, tags, dates)
│           ├── ContentDisplay (rendered Markdown or key-value)
│           └── ActionButtons (edit, delete)
│
└── PublicLayout
    ├── LoginPage
    └── RegisterPage
```

### State Management Strategy

**Zustand Stores** (Global State):

```javascript
// authStore.js
{
  user: null,
  token: null,
  login: async (credentials) => {...},
  logout: () => {...},
  isAuthenticated: () => {...}
}

// notesStore.js
{
  notes: [],
  currentNote: null,
  loading: false,
  error: null,
  fetchNotes: async () => {...},
  createNote: async (data) => {...},
  updateNote: async (id, data) => {...},
  deleteNote: async (id) => {...}
}

// searchStore.js
{
  query: '',
  filters: {},
  results: [],
  setQuery: (query) => {...},
  setFilters: (filters) => {...},
  performSearch: async () => {...}
}

// themeStore.js
{
  theme: 'light',
  toggleTheme: () => {...}
}
```

**Component State** (Local):
- Form inputs (controlled components)
- UI toggles (modals, dropdowns)
- Temporary data (search suggestions)

### Routing Strategy

```javascript
<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  {/* Protected Routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/notes/new" element={<NoteEditorPage />} />
    <Route path="/notes/:id" element={<NoteViewPage />} />
    <Route path="/notes/:id/edit" element={<NoteEditorPage />} />
  </Route>
</Routes>
```

---

## Data Flow

### Note Creation Flow

```
┌─────────────┐
│   User      │
│ Fills Form  │
└──────┬──────┘
       │
       ↓
┌──────────────────┐
│ NoteEditorPage   │
│ - Validates form │
│ - Calls API      │
└──────┬───────────┘
       │
       ↓ notesStore.createNote()
┌──────────────────┐
│  notesStore      │
│ - Sets loading   │
│ - API call       │
└──────┬───────────┘
       │
       ↓ POST /api/notes/
┌──────────────────┐
│  Backend API     │
│ - Validates      │
│ - Creates note   │
│ - Returns JSON   │
└──────┬───────────┘
       │
       ↓ DB INSERT
┌──────────────────┐
│  PostgreSQL      │
│ - Saves note     │
│ - Returns ID     │
└──────┬───────────┘
       │
       ↓ Response
┌──────────────────┐
│  notesStore      │
│ - Updates state  │
│ - Clears loading │
└──────┬───────────┘
       │
       ↓ Toast notification
┌──────────────────┐
│  UI Update       │
│ - Success toast  │
│ - Navigate       │
└──────────────────┘
```

### Search Flow

```
┌────────────┐
│ User Types │
│ in Search  │
└─────┬──────┘
      │
      ↓ (debounced 300ms)
┌───────────────┐
│ SearchBar     │
│ - Updates     │
│   query state │
└─────┬─────────┘
      │
      ↓ searchStore.performSearch()
┌───────────────────┐
│ searchStore       │
│ - Builds params   │
│ - API call        │
└─────┬─────────────┘
      │
      ↓ GET /api/notes/?search=...
┌───────────────────┐
│ Backend API       │
│ - Full-text query │
│ - JSONB query     │
│ - Tag filtering   │
└─────┬─────────────┘
      │
      ↓ DB Query with GIN indexes
┌───────────────────┐
│ PostgreSQL        │
│ - ts_vector search│
│ - JSONB contains  │
│ - Returns results │
└─────┬─────────────┘
      │
      ↓ Response + Analytics tracking
┌───────────────────┐
│ Backend           │
│ - Logs search     │
│ - Returns results │
└─────┬─────────────┘
      │
      ↓
┌───────────────────┐
│ searchStore       │
│ - Updates results │
└─────┬─────────────┘
      │
      ↓
┌───────────────────┐
│ UI Update         │
│ - Displays notes  │
│ - Shows count     │
└───────────────────┘
```

---

## Security Architecture

### Authentication & Authorization

**JWT-Based Authentication:**
1. User logs in with username/password
2. Server validates credentials (bcrypt)
3. Server generates JWT token with user info
4. Client stores token (memory or localStorage)
5. Client sends token in `Authorization: Bearer {token}` header
6. Server validates token on each request
7. Token expires after configurable time (default: 30 minutes)

**Authorization Levels:**
- All notes, tags, and searches are user-scoped
- Users can only access their own data
- Database queries always filter by `user_id`

### Password Security

```python
# Hashing (during registration)
password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# Verification (during login)
is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_hash)
```

### CORS Configuration

```python
# app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Configurable
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Input Validation

**Backend (Pydantic):**
```python
class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    note_type: Literal['text', 'structured']
    content_text: Optional[str] = None
    content_structured: Optional[Dict[str, Any]] = None
```

**Frontend (Yup):**
```javascript
const schema = yup.object({
  title: yup.string().required().max(255),
  note_type: yup.string().oneOf(['text', 'structured']),
  content_text: yup.string().when('note_type', {
    is: 'text',
    then: yup.string().required()
  })
});
```

### SQL Injection Prevention

SQLAlchemy ORM uses parameterized queries automatically:
```python
# Safe - parameterized
db.query(Note).filter(Note.id == note_id).first()

# Never do this (vulnerable to SQL injection)
# db.execute(f"SELECT * FROM notes WHERE id = {note_id}")
```

---

## Scalability Considerations

### Current Architecture (Single Server)

```
┌──────────────────────────────┐
│   Docker Compose (Dev)       │
│  ┌────────────────────────┐  │
│  │  React Frontend (Vite) │  │
│  │  Port 3000             │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  FastAPI Backend       │  │
│  │  Port 8000             │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  PostgreSQL            │  │
│  │  Port 5432             │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

### Scaling Strategies

#### 1. Vertical Scaling
- Increase server resources (CPU, RAM, storage)
- Optimize database queries (indexes, query planning)
- Add database connection pooling
- Enable query result caching

#### 2. Horizontal Scaling (Future)

**Load Balancer Architecture:**
```
                  ┌──────────────┐
Internet ────────>│ Load Balancer│
                  │  (nginx)     │
                  └──────┬───────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ↓              ↓              ↓
    ┌─────────┐    ┌─────────┐    ┌─────────┐
    │ API #1  │    │ API #2  │    │ API #3  │
    └────┬────┘    └────┬────┘    └────┬────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
                        ↓
              ┌──────────────────┐
              │  PostgreSQL      │
              │  (Primary)       │
              └──────────────────┘
                        │
                        ↓ (Replication)
              ┌──────────────────┐
              │  PostgreSQL      │
              │  (Read Replicas) │
              └──────────────────┘
```

**Session Management:**
- Stateless API servers (JWT tokens)
- Shared cache layer (Redis) for session data
- Database connection pooling per server

#### 3. Database Optimization

**Indexes:**
- Already implemented: GIN indexes for full-text search and JSONB
- Add composite indexes for common query patterns
- Regular VACUUM and ANALYZE operations

**Read Replicas:**
- Primary server: Write operations
- Read replicas: Search and list operations
- Async replication with acceptable lag

**Caching Layer (Future):**
```
┌──────────────┐
│  Redis Cache │
├──────────────┤
│ - User data  │
│ - Popular    │
│   searches   │
│ - Session    │
│   data       │
└──────────────┘
```

#### 4. CDN & Static Assets

**Production Setup:**
```
┌─────────────────────────────────────┐
│  CDN (CloudFlare/Cloudfront)        │
│  - Static JS/CSS/images             │
│  - Caching, compression             │
└─────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  Origin Server (nginx)              │
│  - Serves API requests              │
│  - Falls back to S3 for static      │
└─────────────────────────────────────┘
```

---

## Performance Considerations

### Backend Optimizations

1. **Database Query Optimization:**
   - Use `select_related` and `joinedload` for eager loading
   - Limit result sets with pagination
   - Use database indexes on frequently queried columns

2. **Connection Pooling:**
   ```python
   engine = create_engine(
       DATABASE_URL,
       poolclass=QueuePool,
       pool_size=10,
       max_overflow=20
   )
   ```

3. **Async Operations (Future):**
   - FastAPI supports async/await
   - Use `asyncpg` for async PostgreSQL driver
   - Background tasks for non-critical operations (analytics tracking)

### Frontend Optimizations

1. **Code Splitting:**
   - Route-based code splitting with React.lazy()
   - Lazy load heavy components (editor, analytics)

2. **Asset Optimization:**
   - Vite's automatic minification and tree-shaking
   - Image optimization (WebP, lazy loading)
   - Font subsetting

3. **Debouncing & Throttling:**
   - Search input debounced (300ms)
   - Window resize events throttled
   - API call deduplication

---

## Monitoring & Observability (Future)

```
┌─────────────────────────────────────┐
│  Application Metrics                │
│  - Request rate, latency            │
│  - Error rates by endpoint          │
│  - Database query times             │
└─────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  Logging (Structured JSON)          │
│  - Application logs                 │
│  - Access logs                      │
│  - Error logs with stack traces     │
└─────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  Monitoring Dashboard               │
│  (Prometheus + Grafana)             │
│  - Real-time metrics                │
│  - Alerting rules                   │
└─────────────────────────────────────┘
```

---

## Deployment Architecture

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment strategies.

---

## Future Architecture Enhancements

### Phase 2-3
- **Microservices**: Split search, analytics into separate services
- **Message Queue**: RabbitMQ/Kafka for async processing
- **File Storage**: S3-compatible storage for attachments
- **WebSockets**: Real-time collaboration features

### Phase 4-5
- **OCR Pipeline**: Background processing for image text extraction
- **Search Service**: Dedicated Elasticsearch instance
- **Notification Service**: Email/push notifications
- **Mobile API**: GraphQL layer for mobile apps

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Twelve-Factor App](https://12factor.net/)

---

**Last Updated**: October 29, 2025  
**Version**: 1.0.0
