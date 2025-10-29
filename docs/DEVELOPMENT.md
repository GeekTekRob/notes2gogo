# 🛠️ Development Guide

Comprehensive guide for setting up your development environment and contributing to Notes2GoGo.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Development Workflow](#development-workflow)
- [Common Issues & Solutions](#common-issues--solutions)
- [Testing](#testing)
- [Debugging](#debugging)
- [Code Quality](#code-quality)
- [Database Management](#database-management)
- [Docker Development](#docker-development)
- [IDE Configuration](#ide-configuration)

---

## Quick Start

### Prerequisites Checklist

- [ ] **Python 3.11+** installed
- [ ] **Node.js 18+** and npm installed
- [ ] **Docker Desktop** installed and running
- [ ] **Git** installed
- [ ] **Code editor** (VS Code recommended)

### 5-Minute Setup

```bash
# 1. Clone and enter directory
git clone https://github.com/GeekTekRob/notes2gogo.git
cd notes2gogo

# 2. Start everything with Docker
docker compose up -d

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

✅ That's it! The app should be running.

---

## Detailed Setup

### Backend Setup (Python/FastAPI)

#### 1. Create Virtual Environment

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### 2. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Requirements include:**
- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server
- `sqlalchemy` - ORM
- `alembic` - Database migrations
- `psycopg2-binary` - PostgreSQL driver
- `python-jose[cryptography]` - JWT tokens
- `passlib[bcrypt]` - Password hashing
- `python-multipart` - Form data parsing
- `pydantic` - Data validation

#### 3. Set Up Environment Variables

Create `.env` file in `backend/` directory:

```env
# Database
DATABASE_URL=postgresql://notes_user:notes_password@localhost:5432/notes2gogo

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]

# Environment
DEBUG=true
ENVIRONMENT=development
```

**Generate a strong SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

#### 4. Start PostgreSQL

**Option A: Docker (Recommended)**
```bash
docker run -d \
  --name notes2gogo-db \
  -e POSTGRES_USER=notes_user \
  -e POSTGRES_PASSWORD=notes_password \
  -e POSTGRES_DB=notes2gogo \
  -p 5432:5432 \
  postgres:15-alpine
```

**Option B: Local PostgreSQL**
- Install PostgreSQL 15+
- Create database: `createdb notes2gogo`
- Create user and grant permissions

#### 5. Run Migrations

```bash
cd backend
alembic upgrade head
```

You should see output like:
```
INFO  [alembic.runtime.migration] Running upgrade -> 191a68a0d119, initial migration
INFO  [alembic.runtime.migration] Running upgrade 191a68a0d119 -> 2b3c4d5e6f7a, add tags table
...
```

#### 6. Start Backend Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify it's working:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health check: http://localhost:8000/ (should return `{"status": "healthy"}`)

---

### Frontend Setup (React/Vite)

#### 1. Install Dependencies

```bash
cd frontend
npm install
```

**Key dependencies:**
- `react` & `react-dom` - UI library
- `vite` - Build tool
- `react-router-dom` - Routing
- `axios` - HTTP client
- `zustand` - State management
- `react-hook-form` - Form handling
- `yup` - Validation
- `tailwindcss` - Styling
- `@heroicons/react` - Icons

#### 2. Environment Variables

Create `.env` file in `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

#### 3. Start Development Server

```bash
npm run dev
```

**Output:**
```
  VITE v5.0.0  ready in 342 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Verify it's working:**
- Open http://localhost:3000
- You should see the login page
- Register a new account to test

---

## Development Workflow

### Daily Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Start development servers
# Terminal 1: Backend
cd backend && uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev

# 4. Make changes and test

# 5. Run tests
cd backend && pytest
cd frontend && npm test

# 6. Commit changes
git add .
git commit -m "feat: add my feature"

# 7. Push and create PR
git push origin feature/my-feature
```

### Hot Reload

Both backend and frontend support hot reload:

**Backend (FastAPI):**
- Automatically reloads when Python files change
- Watch for: "INFO: Will watch for changes in these directories..."
- If reload fails, restart manually with `Ctrl+C` then `uvicorn app.main:app --reload`

**Frontend (Vite):**
- Instant HMR (Hot Module Replacement)
- Updates in browser without full reload
- If broken, refresh browser (F5) or restart dev server

---

## Common Issues & Solutions

### Backend Issues

#### Issue: `ModuleNotFoundError: No module named 'app'`

**Cause:** Python path not set correctly or not in right directory.

**Solution:**
```bash
# Make sure you're in the backend directory
cd backend

# Ensure virtual environment is activated
source venv/bin/activate  # or .\venv\Scripts\Activate.ps1

# Run from backend directory
uvicorn app.main:app --reload
```

---

#### Issue: `sqlalchemy.exc.OperationalError: connection refused`

**Cause:** PostgreSQL not running or wrong connection details.

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps  # Should show postgres container

# Or check local PostgreSQL
pg_isready -h localhost -p 5432

# Verify DATABASE_URL in .env
echo $DATABASE_URL  # macOS/Linux
$env:DATABASE_URL   # Windows PowerShell

# Restart database
docker restart notes2gogo-db
```

---

#### Issue: `alembic.util.exc.CommandError: Can't locate revision identified by 'xxxx'`

**Cause:** Migration history mismatch between code and database.

**Solution:**
```bash
# Option 1: Reset database (DEV ONLY - loses all data)
docker compose down -v
docker compose up -d db
alembic upgrade head

# Option 2: Check current migration
alembic current

# Option 3: Check migration history
alembic history --verbose
```

---

#### Issue: `ImportError: cannot import name 'X' from 'app.models'`

**Cause:** Circular imports or missing `__init__.py`.

**Solution:**
```bash
# Check all directories have __init__.py
ls -la app/models/    # Should have __init__.py
ls -la app/schemas/   # Should have __init__.py

# Try clearing Python cache
find . -type d -name __pycache__ -exec rm -rf {} +
find . -name "*.pyc" -delete
```

---

#### Issue: `pydantic.ValidationError` on API requests

**Cause:** Request data doesn't match schema definition.

**Solution:**
- Check API docs: http://localhost:8000/docs
- Click endpoint → "Try it out" → See expected schema
- Compare your request with schema requirements
- Check required fields, data types, and constraints

**Example:**
```python
# If you see: "field required"
# Schema expects:
{
  "title": "string",        # Required
  "note_type": "text",      # Required
  "content_text": "string"  # Required for text notes
}
```

---

### Frontend Issues

#### Issue: `npm install` fails with errors

**Cause:** Node version incompatibility or corrupted cache.

**Solution:**
```bash
# Check Node version (need 18+)
node --version

# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

#### Issue: `Vite: Network error` or blank page

**Cause:** API server not running or wrong URL.

**Solution:**
```bash
# 1. Check backend is running
curl http://localhost:8000/

# 2. Check VITE_API_URL in frontend/.env
cat frontend/.env
# Should be: VITE_API_URL=http://localhost:8000

# 3. Check browser console (F12)
# Look for CORS errors or 404s

# 4. Restart frontend dev server
cd frontend
npm run dev
```

---

#### Issue: `CORS policy` errors in browser console

**Cause:** Backend not allowing frontend origin.

**Solution:**
```python
# Check backend/app/main.py
# Should include your frontend URL:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ← Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Or in backend/.env:
ALLOWED_ORIGINS=["http://localhost:3000"]
```

---

#### Issue: React components not updating

**Cause:** State not updating correctly or caching.

**Solution:**
```bash
# 1. Hard refresh browser
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)

# 2. Clear browser cache
# Browser DevTools → Application → Clear storage

# 3. Check React DevTools
# Install React DevTools extension
# Check component state and props

# 4. Restart dev server
Ctrl+C
npm run dev
```

---

### Docker Issues

#### Issue: `docker compose up` fails with port conflict

**Cause:** Port already in use by another service.

**Solution:**
```bash
# Check what's using the port
netstat -ano | findstr :8000  # Windows
lsof -i :8000                  # macOS/Linux

# Option 1: Stop conflicting service

# Option 2: Change port in docker-compose.yml
ports:
  - "8001:8000"  # Use different host port
```

---

#### Issue: `docker: permission denied`

**Cause:** User doesn't have Docker permissions (Linux).

**Solution:**
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or:
newgrp docker

# Test
docker ps
```

---

#### Issue: Database data persists after `docker compose down`

**Cause:** Docker volumes not removed.

**Solution:**
```bash
# Remove volumes (DELETES ALL DATA)
docker compose down -v

# Or remove specific volume
docker volume ls
docker volume rm notes2gogo_postgres_data
```

---

### Database Issues

#### Issue: Migration fails with `relation already exists`

**Cause:** Database schema out of sync with migrations.

**Solution:**
```bash
# Check current migration
alembic current

# Option 1: Stamp database with latest migration
alembic stamp head

# Option 2: Reset database (DEV ONLY)
dropdb notes2gogo  # If using local PostgreSQL
createdb notes2gogo
alembic upgrade head
```

---

#### Issue: Can't connect to database with GUI tools

**Cause:** Wrong connection details or port not exposed.

**Solution:**
```bash
# Connection details:
Host: localhost
Port: 5432
Database: notes2gogo
Username: notes_user
Password: notes_password

# Check port is exposed in docker-compose.yml:
services:
  db:
    ports:
      - "5432:5432"  # ← Should be here

# Test connection
psql -h localhost -U notes_user -d notes2gogo
```

---

## Testing

### Backend Testing

#### Run All Tests
```bash
cd backend
pytest
```

#### Run with Coverage
```bash
pytest --cov=app tests/
```

#### Run Specific Test File
```bash
pytest tests/test_notes.py
```

#### Run Specific Test Function
```bash
pytest tests/test_notes.py::test_create_note
```

#### Verbose Output
```bash
pytest -v -s
```

**Test Structure:**
```
backend/tests/
├── conftest.py           # Fixtures
├── test_main.py          # App startup tests
├── test_auth.py          # Authentication tests
├── test_notes.py         # Notes CRUD tests
├── test_tags.py          # Tags tests
└── test_search.py        # Search tests
```

---

### Frontend Testing

#### Run All Tests
```bash
cd frontend
npm test
```

#### Run with Coverage
```bash
npm run test:coverage
```

#### Watch Mode
```bash
npm test -- --watch
```

#### Update Snapshots
```bash
npm test -- -u
```

**Test Structure:**
```
frontend/src/
├── components/
│   ├── Navbar.jsx
│   └── __tests__/
│       └── Navbar.test.jsx
├── pages/
│   ├── DashboardPage.jsx
│   └── __tests__/
│       └── DashboardPage.test.jsx
```

---

## Debugging

### Backend Debugging

#### VS Code Configuration

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "app.main:app",
        "--reload",
        "--host", "0.0.0.0",
        "--port", "8000"
      ],
      "jinja": true,
      "justMyCode": false,
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

**Set breakpoints:**
- Click left margin in VS Code
- Hit F5 to start debugging
- Execution pauses at breakpoints

#### Print Debugging
```python
# Add to any route or function
print(f"DEBUG: user_id={user_id}, note_id={note_id}")

# Better: Use logging
import logging
logger = logging.getLogger(__name__)
logger.info(f"Creating note for user {user_id}")
logger.error(f"Failed to create note: {str(e)}")
```

#### Database Query Debugging
```python
# Enable SQLAlchemy echo
engine = create_engine(DATABASE_URL, echo=True)

# Will print all SQL queries:
# INFO sqlalchemy.engine.Engine SELECT notes.id, notes.title...
```

---

### Frontend Debugging

#### React DevTools
1. Install [React Developer Tools](https://react.dev/learn/react-developer-tools)
2. Open browser DevTools (F12)
3. Click "Components" tab
4. Inspect component state and props

#### Browser DevTools
```javascript
// Console debugging
console.log('Current user:', user);
console.table(notes);  // Pretty table format
console.error('API call failed:', error);

// Debugger statement
function handleSubmit() {
  debugger;  // Execution pauses here
  api.createNote(data);
}
```

#### Network Debugging
1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Click request to see:
   - Headers (including Authorization)
   - Payload (request body)
   - Response
   - Timing

#### Redux/Zustand DevTools
```javascript
// Install Zustand DevTools
import { devtools } from 'zustand/middleware';

const useStore = create(
  devtools((set) => ({
    // ... your store
  }))
);
```

---

## Code Quality

### Linting

#### Python (Backend)
```bash
# Install linting tools
pip install pylint black isort

# Run pylint
pylint app/

# Format with black
black app/

# Sort imports
isort app/
```

#### JavaScript (Frontend)
```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint:fix

# Format with Prettier
npm run format
```

### Pre-commit Hooks

Install pre-commit hooks:
```bash
# Install pre-commit
pip install pre-commit

# Install hooks from .pre-commit-config.yaml
pre-commit install

# Run manually
pre-commit run --all-files
```

---

## Database Management

### Migrations Workflow

#### Create New Migration
```bash
cd backend

# Auto-generate migration
alembic revision --autogenerate -m "add new column to notes"

# Check generated migration in backend/alembic/versions/
# Edit if needed

# Apply migration
alembic upgrade head
```

#### Check Current State
```bash
# Current migration
alembic current

# Full history
alembic history

# Show SQL (without applying)
alembic upgrade head --sql
```

#### Rollback Migration
```bash
# Rollback one migration
alembic downgrade -1

# Rollback to specific migration
alembic downgrade 191a68a0d119

# Rollback all
alembic downgrade base
```

### Database Inspection

#### PostgreSQL CLI
```bash
# Connect to database
psql -h localhost -U notes_user -d notes2gogo

# Common commands:
\dt          # List tables
\d notes     # Describe notes table
\du          # List users
\l           # List databases
\q           # Quit
```

#### GUI Tools
- **pgAdmin**: https://www.pgadmin.org/
- **DBeaver**: https://dbeaver.io/
- **TablePlus**: https://tableplus.com/

---

## Docker Development

### Docker Compose Commands

```bash
# Start all services
docker compose up -d

# Start specific service
docker compose up -d backend

# View logs
docker compose logs -f backend

# Stop all services
docker compose down

# Rebuild and start
docker compose up --build -d

# Remove volumes (DELETES DATA)
docker compose down -v

# Execute command in container
docker compose exec backend bash
docker compose exec db psql -U notes_user notes2gogo
```

### Debugging Docker Issues

```bash
# Check container status
docker compose ps

# View logs for service
docker compose logs backend

# Enter container shell
docker compose exec backend bash

# Check environment variables
docker compose exec backend env

# Restart single service
docker compose restart backend
```

---

## IDE Configuration

### VS Code Extensions

**Recommended:**
- Python (ms-python.python)
- Pylance (ms-python.vscode-pylance)
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- Tailwind CSS IntelliSense (bradlc.vscode-tailwindcss)
- Docker (ms-azuretools.vscode-docker)
- GitLens (eamodio.gitlens)

### VS Code Settings

Create `.vscode/settings.json`:
```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/backend/venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[python]": {
    "editor.defaultFormatter": "ms-python.python"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

---

## Tips & Best Practices

### Performance Tips

1. **Use pagination** when fetching large lists
2. **Enable SQLAlchemy query caching** for repeated queries
3. **Use React.memo()** for expensive components
4. **Debounce search inputs** (already implemented)
5. **Lazy load components** with React.lazy()

### Security Tips

1. **Never commit `.env` files** to git
2. **Use strong SECRET_KEY** in production
3. **Enable HTTPS** in production
4. **Validate all inputs** on both frontend and backend
5. **Keep dependencies updated** regularly

### Debugging Tips

1. **Check browser console** (F12) for frontend errors
2. **Check terminal logs** for backend errors
3. **Use React DevTools** to inspect component state
4. **Test API endpoints** in http://localhost:8000/docs
5. **Use `print()` statements** liberally during debugging

---

## Getting Help

If you're still stuck after trying these solutions:

1. 📖 Check the [documentation](../README.md)
2. 🔍 Search [existing issues](https://github.com/GeekTekRob/notes2gogo/issues)
3. 💬 Ask in [GitHub Discussions](https://github.com/GeekTekRob/notes2gogo/discussions)
4. 🐛 [Open an issue](https://github.com/GeekTekRob/notes2gogo/issues/new/choose) with:
   - Steps to reproduce
   - Error messages
   - Your environment (OS, Python/Node versions)
   - What you've already tried

---

**Happy coding! 🚀**
